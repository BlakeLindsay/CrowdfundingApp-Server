const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

async function validateSession(req, res, next) {
	try {
		const token = req.headers.authorization;
		console.log(token);
		const decoded = await jwt.verify(token, process.env.JWT);
		const user = await User.findById(decoded.id);
		if (!user) throw new Error("User not found");
		req.user = user;
		return next();
	} catch (error) {
		console.log(error);
		res.status(403).json({message: error.message });
	}
};

module.exports = validateSession;