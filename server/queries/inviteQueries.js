const Invite = require('../models/Invite');

const createInviteQuery = async (email) => {
    const newInvite = new Invite({
        recipient_email: email
    });
    return await newInvite.save();
};


const getAllInvitesQuery = async () => {
    return await Invite.find({});
};

module.exports = {
    createInviteQuery,
    getAllInvitesQuery
};