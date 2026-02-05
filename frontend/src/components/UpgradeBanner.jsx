import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UpgradeBanner = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // If user has an active subscription, don't show banner
    if (user?.subscription?.status === 'active') {
        const endDate = new Date(user.subscription.endDate);
        if (endDate > new Date()) return null;
    }

    // Default to show banner if no sub or expired
    return (
        <div className="alert alert-warning d-flex justify-content-between align-items-center mb-0" role="alert">
            <div>
                <strong>Upgrade to Pro!</strong> Get access to Broadcasts, detailed Analytics, and more.
            </div>
            <button
                className="btn btn-sm btn-dark"
                onClick={() => navigate('/pricing')}
            >
                View Plans
            </button>
        </div>
    );
};

export default UpgradeBanner;
