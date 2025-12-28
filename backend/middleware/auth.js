const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'arogya_vault_super_secret_key_2024';
const STATIC_JWT_TOKEN = process.env.STATIC_JWT_TOKEN; // Optional preissued token

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];

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
