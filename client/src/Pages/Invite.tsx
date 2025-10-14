// src/Pages/Invite.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Make sure axios is installed: npm install axios
import styles from './design/invite.module.css';
import clsx from 'clsx';


const API_URL = 'http://localhost:5000/api/invites';


interface Invite {
    _id: string;
    recipient_email: string;
    status: 'pending' | 'accepted' | 'declined';
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
    // We don't have a delete route yet, so this is commented out for now
    // onDeleteInvite: (id: string) => void;
}

const InviteList: React.FC<InviteListProps> = ({ invites }) => {
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
                        })}
                    >
                        <span>{invite.recipient_email} - <strong>{invite.status}</strong></span>
                        {/* Add revoke functionality back when the DELETE API endpoint is created */}
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
          setInvites([...invites, response.data.data]);
        } else {
          setInvites([...invites, response.data]);
        }
    };

    // We don't have a DELETE API route yet
    // const handleDeleteInvite = (inviteId: string) => {};

    return (
        <>
            <div className={styles.orangeBackground} />
            <div className={styles.pageContainer}>
                <h2>Manage Invites</h2>
                <InviteForm onSendInvite={handleSendInvite} />
                <InviteList invites={invites} />
            </div>
        </>
    );
};

export default InvitesPage;