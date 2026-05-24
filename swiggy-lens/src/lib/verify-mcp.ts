import { config } from "dotenv";
import { resolve } from "node:path";

import {
  callMCPTool,
  closeMCPClients,
  createMCPClients,
} from "./swiggy-mcp";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const accessToken = process.env.SWIGGY_ACCESS_TOKEN?.trim();

  if (!accessToken) {
    console.error(
      "SWIGGY_ACCESS_TOKEN is not set. Copy .env.example to .env.local and add your token."
    );
    process.exit(1);
  }

  let clients;

  try {
    console.log("Connecting to Swiggy food MCP server...");
    clients = await createMCPClients(accessToken);

    console.log("Calling get_addresses...");
    const addresses = await callMCPTool(clients.food, "get_addresses");

    console.log("MCP connection verified. Saved addresses:");
    console.log(JSON.stringify(addresses, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("MCP verification failed:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    if (clients) {
      await closeMCPClients(clients);
    }
  }
}

main();
