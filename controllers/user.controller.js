const router = require('express').Router();

const User = require('../models/user.model.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validateSession = require('../middleware/validateSession');

expireTime = '1 hour';

/**
 * the first user created is made admin
 */
router.post('/signup', async (req, res) => {
	try {
		const user = new User({
			username: req.body.username,
			email: req.body.email,
			password: bcrypt.hashSync(req.body.password, 10)
		});

		const isUsers = await User.findOne();
		if (!isUsers) user.isAdmin = true;
		
		const newUser = await user.save();

		const token = jwt.sign({ id: newUser._id }, process.env.JWT, { expiresIn: expireTime } );

		res.status(200).json({
			user: newUser,
			message: 'Success! User Created!',
			token
		});
	} catch (error) {
		res.status(500).json({
			ERROR: error.message
		});
	}
});

router.post('/login', async function(req, res) {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email: email });

		if (!user) {
			throw new Error('Email or Password does not match');
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT, { expiresIn: expireTime });

		const passwordMatch = await bcrypt.compare(password, user.password);

		if (!passwordMatch) throw new Error('Email or Password does not match');

		res.status(200).json({
			user,
			message: 'Successful Login!',
			token
		});

	} catch (error) {
		res.status(500).json({
			ERROR: error.message
		});
	}
});

/**
 * regular users can only delete themselves, admins can delete any user
 */
router.delete('/delete/:id', validateSession, async function(req, res) {
	try {
		const { id: id } = req.params;
		const userId = req.user._id;

		const user = await User.findById(userId);

		if (userId == id || user.isAdmin) {

			const deletedUser = await User.findByIdAndDelete(id);

			res.status(200).json({
				deletedUser,
				message: 'successfully deleted user'
			});

		} else {
			throw new Error('not admin');
		}

	} catch (error) {
		res.status(500).json({
			ERROR: error.message
		});
	}
});

/**
 * admins can directly add users with specific settings (including isAdmin)
 */
router.post('/add', validateSession, async function(req, res) {
	try {
		const userId = req.user._id;

		const user = await User.findById(userId);

		if (user.isAdmin) {
			const newUser = new User({
				username: req.body.username,
				email: req.body.email,
				password: bcrypt.hashSync(req.body.password, 10),
				isAdmin: req.body.isAdmin
			});

			const addedUser = await newUser.save();

			res.status(200).json({
				addedUser,
				message: 'successfully added user'
			});

		} else {
			throw new Error('not admin');
		}

	} catch (error) {
		res.status(500).json({
			ERROR: error.message
		});
	}
});

/**
 * admins can promote other users to admins
 */
router.patch('/admin/promote/:id', validateSession, async function(req, res) {
	try {
		const { id: id } = req.params;
		const userId = req.user._id;

		const user = await User.findById(userId);

		if (user.isAdmin) {

			const promotedUser = await User.findByIdAndUpdate(id, {isAdmin: true}, {new: true});

			res.status(200).json({
				promotedUser: promotedUser,
				message: 'successfully promoted user'
			});

		} else {
			throw new Error('not admin');
		}

	} catch (error) {
		res.status(500).json({
			ERROR: error.message
		});
	}
});

/**
 * admins can change permissions of other users
 */
router.patch('/permissions/:id', validateSession, async function(req, res) {
	try {
		const { id: id } = req.params;
		const userId = req.user._id;

		const user = await User.findById(userId);

		if (user.isAdmin) {
			const newPerms = {
				isAdmin: req.body.isAdmin,
				canMakeCampaign: req.body.canMakeCampaign
			}

			const editedUser = await User.findByIdAndUpdate(id, newPerms, {new: true});

			res.status(200).json({
				editedUser: editedUser,
				message: 'successfully edited user'
			});

		} else {
			throw new Error('not admin');
		}

	} catch (error) {
		res.status(500).json({
			ERROR: error.message
		});
	}
});

module.exports = router;