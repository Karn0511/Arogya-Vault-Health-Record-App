const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const crypto = require('crypto');

// Function to verify password (matching server.js implementation)
const verifyPassword = (storedPassword, plainPassword) => {
    if (!storedPassword) return false;
    if (!storedPassword.includes(':')) {
        return storedPassword === plainPassword;
    }
    const [salt, hash] = storedPassword.split(':');
    const testHash = crypto.pbkdf2Sync(plainPassword, salt, 1000, 64, 'sha512').toString('hex');
    return hash === testHash;
};

// =========================================================================
// LOCAL STRATEGY
// =========================================================================
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }

        if (!verifyPassword(user.password, password)) {
            return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// =========================================================================
// GOOGLE STRATEGY
// =========================================================================
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // Explicitly set the callback URL to the deployed domain to avoid any proxy/relative path issues
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://arogya-app-60vk.onrender.com/api/auth/google/callback",
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // 1. Check if user exists by Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            return done(null, user);
        }

        // 2. Check if user exists by Email
        user = await User.findOne({ email: profile.emails[0].value.toLowerCase() });

        if (user) {
            // Link Google ID to existing account
            user.googleId = profile.id;

            // Update name and picture from Google to ensure fresh data
            if (profile.displayName) user.fullName = profile.displayName;
            if (profile.photos && profile.photos[0]) user.profilePicture = profile.photos[0].value;

            await user.save();
            return done(null, user);
        }

        // 3. Create new user
        const newUser = new User({
            fullName: profile.displayName,
            email: profile.emails[0].value.toLowerCase(),
            googleId: profile.id,
            profilePicture: profile.photos[0].value,
            role: 'PATIENT', // Default role
            verified: true // Google accounts are verified
        });

        await newUser.save();
        return done(null, newUser);
    } catch (err) {
        return done(err, null);
    }
}));

module.exports = passport;
