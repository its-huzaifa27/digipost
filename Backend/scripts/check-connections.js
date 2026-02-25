import fs from "fs";
import PlatformConnection from "../src/models/platformConnection.model.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

async function checkConnections() {
  try {
    const connections = await PlatformConnection.findAll({ raw: true });
    let out = `Found ${connections.length} connections:\n`;
    connections.forEach((c) => {
      out += `- ID: ${c.id}\n`;
      out += `  Client: ${c.clientId}, User: ${c.userId}\n`;
      out += `  Platform: ${c.platform}, Page Name: "${c.pageName}", Page ID: ${c.pageId}\n`;
      out += `  Active: ${c.isActive}\n`;
      out += "---\n";
    });
    fs.writeFileSync("output.txt", out, "utf-8");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

checkConnections();
