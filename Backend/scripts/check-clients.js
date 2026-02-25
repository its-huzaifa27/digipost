import fs from "fs";
import Client from "../src/models/client.model.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

async function checkClients() {
  try {
    const clients = await Client.findAll({
      where: { id: "f9fcdda6-0a70-4934-b296-535c48051522" },
      raw: true,
    });
    let out = `Found ${clients.length} clients:\n`;
    clients.forEach((c) => {
      out += `- ID: ${c.id}\n`;
      out += `  User: ${c.userId}\n`;
      out += `  Name: ${c.client_name || c.name}\n`;
      out += "---\n";
    });
    fs.writeFileSync("output-client.txt", out, "utf-8");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

checkClients();
