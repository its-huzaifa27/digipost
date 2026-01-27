export const connectPlatform = (req, res) => {
    const { platform } = req.params;
    const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:5173/auth/callback';

    let url = '';
    
    // SECURE: Client IDs are read from server-side environment variables
    // They are NEVER sent to the client directly
    switch (platform) {
        case 'instagram':
            const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
            if (!INSTAGRAM_CLIENT_ID) return res.status(500).json({ error: 'Server config missing' });
            url = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user_profile,user_media&response_type=code`;
            // url = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user_profile,user_media&response_type=code&force_authentication=1`;
            
            break;
            
        case 'facebook':
            const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
            if (!FACEBOOK_CLIENT_ID) return res.status(500).json({ error: 'Server config missing' });
            url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=pages_manage_posts,publish_video,pages_read_engagement&response_type=code`;
            // url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=pages_manage_posts,publish_video,pages_read_engagement&response_type=code&auth_type=reauthenticate`;
            break;
            
        case 'linkedin':
             const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
             if (!LINKEDIN_CLIENT_ID) return res.status(500).json({ error: 'Server config missing' });
             url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=w_member_social`;
             break;

        case 'twitter':
             url = 'https://twitter.com/i/flow/login'; // Placeholder as Twitter OAuth 2.0 is complex
             break;

        default:
            return res.status(400).json({ error: 'Invalid platform' });
    }

    res.json({ url });
};

export const handleCallback = (req, res) => {
    // This will be implemented to exchange code for token securely on the server
    res.json({ message: 'Auth callback received', code: req.query.code });
}
