import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key', (err, user) => {
        if (err) {
            console.error("Token verification failed:", err.message);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        
        // Attach user info to request
        req.user = user; 
        next();
    });
};
