import express from "express";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {z} from "zod";
import axios from "axios";
import 'dotenv/config';
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";

const app = express();
app.use(express.json());


function getServer() {
    const server = new McpServer({
        name: "XHunt-MCP-Server",
        version: "1.0.0",
    });
    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

    // Get Account Info
    server.tool(
        "getAccountInfo",
        "Used to look up account info by public key (32 byte base58 encoded address)",
        { publicKey: z.string() },
        async ({ publicKey }) => {
            try {
                const pubkey = new PublicKey(publicKey);
                const accountInfo = await connection.getAccountInfo(pubkey);
                return {
                    content: [{ type: "text", text: JSON.stringify(accountInfo, null, 2) }]
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${(error as Error).message}` }]
                };
            }
        }
    );

    // Get Balance
    server.tool(
        "getBalance",
        "Used to look up balance by public key (32 byte base58 encoded address)",
        { publicKey: z.string() },
        async ({ publicKey }) => {
            try {
                const pubkey = new PublicKey(publicKey);
                const balance = await connection.getBalance(pubkey);
                return {
                    content: [{ type: "text", text: `${balance / LAMPORTS_PER_SOL} SOL (${balance} lamports)` }]
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${(error as Error).message}` }]
                };
            }
        }
    );

    // Get Transaction
    server.tool("getTransaction",
        "Used to look up transaction by signature (64 byte base58 encoded string)",
        { signature: z.string() },
        async ({ signature }) => {
            try {
                const transaction = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
                return {
                    content: [{ type: "text", text: JSON.stringify(transaction, null, 2) }]
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${(error as Error).message}` }]
                };
            }
        }
    );

    // Setup specific resources to read from solana.com/docs pages
    server.resource(
        "solanaDocsInstallation",
        new ResourceTemplate("solana://docs/intro/installation", { list: undefined }),
        async (uri) => {
            try {
                const response = await fetch(`https://raw.githubusercontent.com/solana-foundation/solana-com/main/content/docs/intro/installation.mdx`);
                const fileContent = await response.text();
                return {
                    contents: [{
                        uri: uri.href,
                        text: fileContent
                    }]
                };
            } catch (error) {
                return {
                    contents: [{
                        uri: uri.href,
                        text: `Error: ${(error as Error).message}`
                    }]
                };
            }
        }
    );


    server.prompt(
        'calculate-storage-deposit',
        'Calculate storage deposit for a specified number of bytes',
        { bytes: z.string() },
        ({ bytes }) => ({
            messages: [{
                role: 'user',
                content: {
                    type: 'text',
                    text: `Calculate the SOL amount needed to store ${bytes} bytes of data on Solana using getMinimumBalanceForRentExemption.`
                }
            }]
        })
    );

    server.prompt(
        'minimum-amount-of-sol-for-storage',
        'Calculate the minimum amount of SOL needed for storing 0 bytes on-chain',
        () => ({
            messages: [{
                role: 'user',
                content: {
                    type: 'text',
                    text: `Calculate the amount of SOL needed to store 0 bytes of data on Solana using getMinimumBalanceForRentExemption & present it to the user as the minimum cost for storing any data on Solana.`
                }
            }]
        })
    );

    server.prompt(
        'why-did-my-transaction-fail',
        'Look up the given transaction and inspect its logs to figure out why it failed',
        { signature: z.string() },
        ({ signature }) => ({
            messages: [{
                role: 'user',
                content: {
                    type: 'text',
                    text: `Look up the transaction with signature ${signature} and inspect its logs to figure out why it failed.`
                }
            }]
        })
    );

    server.prompt('what-happened-in-transaction',
        'Look up the given transaction and inspect its logs & instructions to figure out what happened',
        { signature: z.string() },
        ({ signature }) => ({
            messages: [{
                role: 'user',
                content: {
                    type: 'text',
                    text: `Look up the transaction with signature ${signature} and inspect its logs & instructions to figure out what happened.`
                }
            }]
        })
    );

    server.tool(
        "getTokenAnalysis",
        "Analyze a token based on Twitter social data",
        { ticker: z.string(), ca: z.string() },
        async ({ ticker, ca }) => {
            try {
                const { data: res } = await axios.post(`${process.env.TOKEN_ANALYSIS}`, {"ticker": ticker, "ca": ca});
                if (res && res.code === 200 && res.data) {
                    return {
                        content: [{ type: "text", text: res.data.answerDS }, { type: "text", text: JSON.stringify(res.data.tweets)}]
                    };
                } else {
                    return {
                        content: [{ type: "text", text: "Xhunt doesn't find this ticker" }]
                    };
                }

            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${(error as Error).message}` }]
                };
            }
        }
    );
    return server;
}


app.post('/mcp', async (req, res) => {

    try {
        // Create an MCP server
        const server = getServer();
        const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
        });
        res.on('close', () => {
            console.log('Request closed');
            transport.close();
            server.close();
        });
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        console.error('Error handling MCP request:', error);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: 'Internal server error',
                },
                id: null,
            });
        }
    }
});


app.get('/mcp', async (req, res) => {
    console.log('Received GET MCP request');
    res.writeHead(405).end(JSON.stringify({
        jsonrpc: "2.0",
        error: {
            code: -32000,
            message: "Method not allowed."
        },
        id: null
    }));
});

app.delete('/mcp', async (req, res) => {
    console.log('Received DELETE MCP request');
    res.writeHead(405).end(JSON.stringify({
        jsonrpc: "2.0",
        error: {
            code: -32000,
            message: "Method not allowed."
        },
        id: null
    }));
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`MCP Stateless Streamable HTTP Server listening on port ${PORT}`);
});
