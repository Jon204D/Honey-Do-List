
const inviteQueries = require('../queries/inviteQueries.js');


exports.createInvite = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        
        const savedInvite = await inviteQueries.createInviteQuery(email);

        
        res.status(201).json(savedInvite);

    } catch (error) {
        res.status(500).json({ message: "Error creating invite.", error: error.message });
    }
};


exports.getAllInvites = async (req, res) => {
    try {
        const invites = await inviteQueries.getAllInvitesQuery();
        
        res.status(200).json(invites);
    } catch (error) {
        res.status(500).json({ message: "Error fetching invites.", error: error.message });
    }
}

const Invite = require('../models/Invite'); 

exports.revokeInvite = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the invite by its ID
        const invite = await Invite.findById(id);

        // If no invite is found, return a 404 error
        if (!invite) {
            return res.status(404).json({ message: 'Invite not found.' });
        }

        if (invite.status !== 'pending') {
            return res.status(400).json({ 
                message: `Cannot revoke an invite with status '${invite.status}'.` 
            });
        }

        invite.status = 'cancelled';
        
        // Save the updated invite to the database
        await invite.save();

        // Send back the updated invite as confirmation
        res.status(200).json(invite);

    } catch (error) {
        console.error('Error revoking invite:', error);
        res.status(500).json({ message: 'Server error while revoking invite.' });
    }
};