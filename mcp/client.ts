import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
    const transport = new StdioClientTransport({
        command: "ts-node",
        args: ["server.ts"]
    });

    const client = new Client(
        {
            name: "example-client",
            version: "1.0.0"
        }
    );

    await client.connect(transport);

// List prompts
    const prompts = await client.listPrompts();
    console.log(prompts);

// Get a prompt
    const prompt = await client.getPrompt({
        name: "calculate-storage-deposit",
        arguments: {
            bytes: "100"
        }
    });
    console.log(prompt.messages[0].content);

// List resources
    const resources = await client.listResources();
    console.log(resources);

// Read a resource
//     const resource = await client.readResource({
//         uri: "file:///example.txt"
//     });

// Call a tool
    const result = await client.callTool({
        name: "getAccountInfo",
        arguments: {
            publicKey: ""
        }
    });
    console.log(result);
}

main();
