// src/pages/InvitesPage.tsx
import React, { useState, useEffect } from 'react';


interface Invite {
  id: number;
  recipient_email: string;
  status: 'pending' | 'accepted' | 'declined';
}


interface InviteFormProps {
  onSendInvite: (email: string) => void;
}

const InviteForm: React.FC<InviteFormProps> = ({ onSendInvite }) => {
    const [email, setEmail] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        onSendInvite(email);
        setEmail('');
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
            <h3>Send a New Invite</h3>
            <input
                type="email"
                placeholder="Enter person's email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                style={{ padding: '8px', marginRight: '8px' }}
            />
            <button type="submit">Send Invite</button>
        </form>
    );
};

// Reusable List
interface InviteListProps {
  invites: Invite[];
  onDeleteInvite: (id: number) => void;
}

const InviteList: React.FC<InviteListProps> = ({ invites, onDeleteInvite }) => {
    if (invites.length === 0) {
        return <p>You haven't sent any invites yet.</p>;
    }

    return (
        <div>
            <h3>Sent Invites</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {invites.map((invite) => (
                    <li key={invite.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '5px' }}>
                        <span>{invite.recipient_email} - <strong>{invite.status}</strong></span>
                        {invite.status === 'pending' && (
                            <button onClick={() => onDeleteInvite(invite.id)} style={{ float: 'right' }}>
                                Revoke
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};


// Main page
const InvitesPage: React.FC = () => {
    const [invites, setInvites] = useState<Invite[]>([]);

    useEffect(() => {
        // This is a placeholder for your actual API call to get invites
        console.log("Fetching invites...");
        const mockInvites: Invite[] = [
            { id: 1, recipient_email: 'friend1@example.com', status: 'accepted' },
            { id: 2, recipient_email: 'friend2@example.com', status: 'pending' },
        ];
        setInvites(mockInvites);
    }, []);

    const handleSendInvite = (email: string) => {
        // Placeholder for your actual API call to create an invite
        console.log(`Sending invite to ${email}`);
        const newInvite: Invite = {
            id: Date.now(),
            recipient_email: email,
            status: 'pending'
        };
        setInvites([...invites, newInvite]);
    };

    const handleDeleteInvite = (inviteId: number) => {
        // Placeholder for your actual API call to delete an invite
        console.log(`Deleting invite ${inviteId}`);
        setInvites(invites.filter(invite => invite.id !== inviteId));
    };

    return (
        <div>
            <h2>Manage Invites</h2>
            <InviteForm onSendInvite={handleSendInvite} />
            <InviteList invites={invites} onDeleteInvite={handleDeleteInvite} />
        </div>
    );
};

export default InvitesPage;