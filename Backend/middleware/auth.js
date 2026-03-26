const jwt = require('jsonwebtoken');
const Admin = require('../Model/Admin');
const User = require('../Model/User');

const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.admin = await Admin.findById(decoded.id).select('-password');
            if (!req.admin) {
                console.log(`❌ Admin Auth Failure: ID ${decoded.id} not found in database. [Path: ${req.path}]`);
                return res.status(401).json({ success: false, message: 'Not authorized, admin not found' });
            }
            
            next();
        } catch (error) {
            console.error(`❌ Admin Token Verification Failed: ${error.message} [Path: ${req.path}]`);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    } else {
        console.log(`⚠️ Admin Auth Failure: No token provided. [Path: ${req.path}]`);
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const protectUser = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = await User.findById(decoded.id);
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }
            
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

module.exports = { protect, protectUser };
