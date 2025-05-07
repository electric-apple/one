import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {z} from "zod";
import axios from "axios";
import 'dotenv/config';
const app = express();
app.use(express.json());


function getServer() {
    const server = new McpServer({
        name: "XHunt-MCP-Server",
        version: "1.0.0",
    });
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
