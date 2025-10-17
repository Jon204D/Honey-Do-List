const express = require('express');
const router = express.Router();
const inviteController = require('../controllers/inviteController');

router.post('/', inviteController.createInvite);
router.get('/', inviteController.getAllInvites);

router.post('/:id/revoke', inviteController.revokeInvite);

module.exports = router;
