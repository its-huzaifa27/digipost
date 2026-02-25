import fs from "fs";
import Client from "../src/models/client.model.js";
import PlatformConnection from "../src/models/platformConnection.model.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

async function checkAll() {
  try {
    const clients = await Client.findAll({ raw: true });
    let out = `Found ${clients.length} clients globally:\n`;
    clients.forEach((c) => {
      out += `- Client ID: ${c.id}, User: ${c.userId}, Name: ${c.client_name || c.name}\n`;
    });

    out += `\nAll Platform Connections:\n`;
    const conns = await PlatformConnection.findAll({ raw: true });
    conns.forEach((c) => {
      out += `- Conn ID: ${c.id}, Client: ${c.clientId}, Platform: ${c.platform}, PageName: ${c.pageName}\n`;
    });

    fs.writeFileSync("output-all.txt", out, "utf-8");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

checkAll();
