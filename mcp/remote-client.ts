import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { URL } from "url"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { TextContentSchema } from "@modelcontextprotocol/sdk/types.js"


class MCPClient {
    tools: {name: string, description: string}[] = []

    private client: Client
    private transport: StreamableHTTPClientTransport | null = null
    private isCompleted = false

    constructor(serverName: string) {
        this.client = new Client({ name: `mcp-client-for-${serverName}`, version: "1.0.0" })
    }

    async connectToServer(serverUrl: string) {
        const url = new URL(serverUrl)
        try {
            this.transport = new StreamableHTTPClientTransport(url)
            await this.client.connect(this.transport)
            console.log("Connected to server")

            this.setUpTransport()
        } catch (e) {
            console.log("Failed to connect to MCP server: ", e)
            throw e
        }
    }

    async listTools() {
        try {
            const toolsResult = await this.client.listTools()
            console.log('Available tools:', toolsResult.tools)
            this.tools = toolsResult.tools.map((tool) => {
                return {
                    name: tool.name,
                    description: tool.description ?? "",
                }
            })
        } catch (error) {
            console.log(`Tools not supported by the server (${error})`);
        }
    }

    async callTool(name: string, ticker="", ca="") {
        try {
            console.log('\nCalling tool: ', name);

            const result  = await this.client.callTool({
                name: "getTokenAnalysis",
                arguments: { ticker: ticker, ca: ca},
            })

            const content = result.content as object[]

            content.forEach((item) => {
                const parse = TextContentSchema.safeParse(item)
                if (parse.success) {
                    console.log(`${parse.data.text}`);
                }
            })
        } catch (error) {
            console.log(`Error calling greet tool: ${error}`);
        }

    }

    private setUpTransport() {
        if (this.transport === null) {
            return
        }
        this.transport.onclose = () => {
            console.log("StreamableHTTPClientTransport closed.")
            this.isCompleted = true
        }

        this.transport.onerror = async (error) => {
            console.log("StreamableHTTPClientTransport error: ", error)
            await this.cleanup()
        }
    }

    async waitForCompletion() {
        while (!this.isCompleted) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    async cleanup() {
        await this.client.close()
    }
}

async function main() {
    const client = new MCPClient("XHunt-MCP-Server")

    try {
        await client.connectToServer("http://localhost:3000/mcp")
        await client.listTools()
        await client.callTool("getTokenAnalysis", "BTC")
        await client.waitForCompletion()
    } finally {
        await client.cleanup()
    }
}

main()