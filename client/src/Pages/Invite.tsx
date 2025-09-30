// src/pages/invite.tsx
import React, { useState, useEffect } from 'react';
import styles from './design/invite.module.css';
import clsx from 'clsx'; // You may need to run: npm install clsx

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
        // FIXED: Uses the correct 'form' class
        <form onSubmit={handleSubmit} className={styles.form}>
            <h3>Send a New Invite</h3>
            <input
                type="email"
                placeholder="Enter person's email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                // FIXED: Inline styles removed
            />
            <button type="submit">Send Invite</button>
        </form>
    );
};

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
            <h3 className={styles.listTitle}>Sent Invites</h3>
            <ul className={styles.inviteList}>
                {invites.map((invite) => (
                    <li
                        key={invite.id}
                        // FIXED: Uses clsx for base and conditional styles
                        className={clsx(styles.inviteItem, {
                            [styles.acceptedStatus]: invite.status === 'accepted',
                            [styles.declinedStatus]: invite.status === 'declined',
                        })}
                    >
                        <span>{invite.recipient_email} - <strong>{invite.status}</strong></span>
                        {invite.status === 'pending' && (
                            // FIXED: Uses the correct 'revokeButton' class
                            <button onClick={() => onDeleteInvite(invite.id)} className={styles.revokeButton}>
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
        const mockInvites: Invite[] = [
            { id: 1, recipient_email: 'friend1@example.com', status: 'accepted' },
            { id: 2, recipient_email: 'friend2@example.com', status: 'pending' },
            { id: 3, recipient_email: 'friend3@example.com', status: 'declined' },
        ];
        setInvites(mockInvites);
    }, []);

    const handleSendInvite = (email: string) => {
        const newInvite: Invite = { id: Date.now(), recipient_email: email, status: 'pending' };
        setInvites([...invites, newInvite]);
    };

    const handleDeleteInvite = (inviteId: number) => {
        setInvites(invites.filter((invite) => invite.id !== inviteId));
    };

    return (
        // ADDED: A React Fragment <> and the new background div
        <>
            <div className={styles.orangeBackground} />
            <div className={styles.pageContainer}>
                <h2>Manage Invites</h2>
                <InviteForm onSendInvite={handleSendInvite} />
                <InviteList invites={invites} onDeleteInvite={handleDeleteInvite} />
            </div>
        </>
    );
};

export default InvitesPage;