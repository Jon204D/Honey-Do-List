// controllers/inviteController.js
const inviteQueries = require("../queries/invitequeries");

const createInvite = async (req, res) => {
    try {
        const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    const savedInvite = await inviteQueries.createInviteQuery(email);
    res.status(201).json(savedInvite);
    } catch (error) {
    res
        .status(500)
        .json({ message: "Error creating invite.", error: error.message });
    }
};

const getAllInvites = async (req, res) => {
    try {
        const invites = await inviteQueries.getAllInvitesQuery();
        res.status(200).json(invites);
    } catch (error) {
    res
        .status(500)
    .json({ message: "Error fetching invites.", error: error.message });
    }
};

module.exports = {
    createInvite,
    getAllInvites,
};