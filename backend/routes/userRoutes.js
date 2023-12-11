const express = require('express');
const { register, login, searchUser } = require('../controller/userController');
const { protect } = require('../Middlewares/authMiddleware');
const router = express.Router();

router.route('/').get(protect, searchUser);
router.route('/register').post(register);
router.route('/login').post(login);

module.exports = router;