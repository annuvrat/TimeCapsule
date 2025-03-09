const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class UserService {
    async register(userData) {
        const { email, username } = userData;
        
        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            throw new Error('User already exists');
        }

        // Create new user
        const user = await User.create(userData);
        return this.generateToken(user);
    }

    async login(email, password) {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid credentials');
        }
        return this.generateToken(user);
    }

    generateToken(user) {
        return {
            token: jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            ),
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        };
    }
}

module.exports = new UserService();