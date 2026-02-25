import axios from 'axios';
import 'dotenv/config';

async function checkApp() {
    const appId = process.env.FACEBOOK_CLIENT_ID;
    const appSecret = process.env.FACEBOOK_CLIENT_SECRET;

    try {
        const appTokenRes = await axios.get(`https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`);
        const appToken = appTokenRes.data.access_token;
        console.log("App Token Acquired");

        const appRes = await axios.get(`https://graph.facebook.com/v19.0/${appId}?access_token=${appToken}&fields=name,id,roles`);
        console.log("App Info:", JSON.stringify(appRes.data, null, 2));

        // Let's also check if we can see any test users or something
    } catch (error) {
        console.error("Error fetching app info:", error.response ? error.response.data : error.message);
    }
}

checkApp();
