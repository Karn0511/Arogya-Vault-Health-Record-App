const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const STATIC_JWT_TOKEN = process.env.STATIC_JWT_TOKEN; // Optional preissued token

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    // Fail fast in production if secret is missing
    throw new Error('JWT_SECRET environment variable is required in production');
}

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'Authentication failed' });
        const token = authHeader.split(' ')[1];

        // Allow a preissued static token for admin/demo access without needing the signing secret
        if (STATIC_JWT_TOKEN && token === STATIC_JWT_TOKEN) {
            req.userData = jwt.decode(token) || { role: 'ADMIN' };
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Authentication failed' });
    }
};
