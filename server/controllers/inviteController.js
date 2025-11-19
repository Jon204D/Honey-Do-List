// controllers/inviteController.js
const inviteQueries = require("../queries/inviteQueries");

const createInvite = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        if (await enviornmentCheck.isProd()) {
            if ((await emailTemplate.sendVerification(email)).status === 'success') {
                const savedInvite = await inviteQueries.createInviteQuery(email);
                res.status(201).json(savedInvite);
            } else {
                throw new Error("Error sending verification email.");
            }
        } else {
            const savedInvite = await inviteQueries.createInviteQuery(email);
            res.status(201).json(savedInvite);
        }
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

const revokeInvite = async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Write logic to delete/revoke invite
    res.status(200).json({ message: `Invite ${id} revoked (placeholder)` });
  } catch (error) {
    res.status(500).json({ message: 'Error revoking invite', error: error.message });
  }
};

module.exports = {
    createInvite,
    getAllInvites,
    revokeInvite,
};