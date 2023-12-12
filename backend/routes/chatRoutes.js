const express = require('express');
const { chatAcess, fetchChats, createGroupChat, renameGroupName, appToGroup, removeFromGroup } = require('../controller/chatController');
const { protect } = require('../Middlewares/authMiddleware');
const router = express.Router();

router.route('/').post(protect, chatAcess).get(protect, fetchChats);

router.route('/group').post(protect, createGroupChat).put(protect, renameGroupName);

router.route('/addNew').put(protect, appToGroup);

router.route('/removeUser').put(protect, removeFromGroup);

module.exports = router;