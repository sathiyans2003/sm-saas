import React, { useEffect, useState } from 'react';
import { getFacebookStatus } from '../api/facebookApi';
import ConnectPhoneNumberPage from '../pages/whatsapp/ConnectPhoneNumberPage';

const FacebookGate = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // Basic connectivity check
        getFacebookStatus()
            .then(res => {
                setConnected(res.data.connected);
            })
            .catch((err) => {
                console.error("Facebook status check failed", err);
                setConnected(false);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="d-flex vh-100 align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!connected) {
        // Return existing Connect Page UI
        // We import it dynamically or assume it's available. 
        // Ideally we should refactor ConnectPhoneNumberPage to be a component we can reuse.
        // For now, let's just inline the Connect Component or Import it.
        // Importing at top level is safer.
        return <ConnectPhoneNumberPage />;
    }

    return children;
};

export default FacebookGate;
