const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'arogya_vault_super_secret_key_2024';

/**
 * Generate a JWT token
 * @param {Object} payload - Data to encode in the token (e.g., userId, email, role)
 * @param {String} expiresIn - Token expiration time (default: '24h')
 * @returns {String} JWT token
 */
function generateToken(payload, expiresIn = '24h') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

// Example usage
if (require.main === module) {
    // Generate a sample token
    const samplePayload = {
        userId: '123456',
        email: 'user@example.com',
        role: 'PATIENT',
        name: 'John Doe'
    };

    const token = generateToken(samplePayload);
    console.log('\n=== Generated JWT Token ===');
    console.log(token);
    console.log('\n=== Decoded Token ===');
    console.log(jwt.decode(token));
    console.log('\n=== Token Info ===');
    console.log('Secret:', JWT_SECRET);
    console.log('Expires in: 24 hours');
}

module.exports = { generateToken, verifyToken };
