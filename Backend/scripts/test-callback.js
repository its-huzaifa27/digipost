import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

async function testCallback() {
  try {
    const res = await fetch("http://localhost:5000/api/meta/callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Use the token of the user from previous tests (requires a valid JWT or we bypass auth for the test route temporarily)
        // We'll skip the auth middleware for the test or just use check-clients directly to simulate the DB insertion
      },
      body: JSON.stringify({
        code: "TEST_CODE",
        clientId: "8fe9f451-df75-4023-8c2c-fc3b1a8baec5", // 'dedcs' client ID
      }),
    });
    console.log(res.status, await res.text());
  } catch (e) {
    console.error(e);
  }
}

testCallback();
