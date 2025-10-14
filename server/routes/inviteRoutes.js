const express = require('express');
const router = express.Router();
const inviteController = require('../controllers/inviteController.js');

router.post('/', inviteController.createInvite);
router.get('/', inviteController.getAllInvites);


module.exports = router;
