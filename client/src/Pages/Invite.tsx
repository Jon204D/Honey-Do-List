// src/Pages/Invite.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Make sure axios is installed: npm install axios
import styles from './design/invite.module.css';
import clsx from 'clsx';

const API_URL = 'http://localhost:5001/api/invites';
// will probably need to be edited to have a similar fetch requests as the others

interface Invite {
    _id: string;
    recipient_email: string;
    status: 'pending' | 'accepted' | 'declined' | 'cancelled';
    createdAt: string;
}

interface InviteFormProps {
    onSendInvite: (email: string) => Promise<void>;
}

const InviteForm: React.FC<InviteFormProps> = ({ onSendInvite }) => {
    useEffect(() => {
        document.title = "Honey-Do List Invite";
    }, []);
    
    const [email, setEmail] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || isSubmitting) return;

        setIsSubmitting(true);
        setError('');
        try {
            await onSendInvite(email);
            setEmail(''); // Clear email on successful submission
        } catch (err: any) {
            // Display error message from the server if available
            setError(err.response?.data?.message || "An error occurred.");
            console.error("Submission failed:", err);
        } finally {
            setIsSubmitting(false); // Re-enable the button
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h3>Send a New Invite</h3>
            <input
                type="email"
                placeholder="Enter person's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Invite'}
            </button>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </form>
    );
};

interface InviteListProps {
    invites: Invite[];
    onRevokeInvite: (id: string) => void;
}

const InviteList: React.FC<InviteListProps> = ({ invites, onRevokeInvite }) => {
    if (invites.length === 0) {
        return <p>You haven't sent any invites yet.</p>;
    }

    return (
        <div>
            <h3 className={styles.listTitle}>Sent Invites</h3>
            <ul className={styles.inviteList}>
                {invites.map((invite) => (
                    <li
                        key={invite._id}
                        className={clsx(styles.inviteItem, {
                            [styles.acceptedStatus]: invite.status === 'accepted',
                            [styles.declinedStatus]: invite.status === 'declined',
                            [styles.cancelledStatus]: invite.status === 'cancelled',
                        })}
                    >
                        <div className={styles.inviteInfo}>
                            <span>{invite.recipient_email} - <strong>{invite.status.toUpperCase()}</strong></span>
                        </div>
                        
                        {invite.status === 'pending' && (
                            <button
                                onClick={() => onRevokeInvite(invite._id)}
                                className={styles.revokeButton}
                            >
                                Revoke
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Main page component
const InvitesPage: React.FC = () => {
    const [invites, setInvites] = useState<Invite[]>([]);

    useEffect(() => {
        const fetchInvites = async () => {
            try {
                const response = await axios.get(API_URL);
                setInvites(response.data); 
            } catch (error) {
                console.error("Failed to fetch invites:", error);
            }
        };

        fetchInvites();
    }, []);

    const handleSendInvite = async (email: string) => {
        const response = await axios.post(API_URL, { email });

        if (response.data && response.data.data) {
          setInvites(prevInvites => [...prevInvites, response.data.data]);
        } else {
          setInvites(prevInvites => [...prevInvites, response.data]);
        }
    };


    const handleRevokeInvite = async (inviteIdToRevoke: string) => {
        try {
              await axios.post(`${API_URL}/${inviteIdToRevoke}/revoke`);

            setInvites(currentInvites =>
                currentInvites.map(invite => {
                    if (invite._id === inviteIdToRevoke) {
                        return { ...invite, status: 'cancelled' };
                    }
                    return invite;
                })
            );
        } catch (error) {
            console.error(`Failed to revoke invite ${inviteIdToRevoke}:`, error);
            alert('Failed to revoke the invite. Please try again.');
        }
    };

    return (
        <>
            <div className={styles.orangeBackground} />
            <div className={styles.pageContainer}>
                <h2>Manage Invites</h2>
                <InviteForm onSendInvite={handleSendInvite} />
                <InviteList invites={invites} onRevokeInvite={handleRevokeInvite} />
            </div>
        </>
    );
};

export default InvitesPage;