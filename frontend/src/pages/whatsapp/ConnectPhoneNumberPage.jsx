// src/pages/whatsapp/ConnectPhoneNumberPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkPhoneNumberLimit } from '../../api/whatsappApi';

const ConnectPhoneNumberPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [limitState, setLimitState] = useState({ isLimitReached: false, currentCount: 0, limit: 0 });

    useEffect(() => {
        checkStatusAndLimit();
    }, []);

    const checkStatusAndLimit = async () => {
        try {
            // Check Facebook Connection Status
            // Dynamically import or use available api function 
            // Ideally we should import at top level but ensuring no circular deps if any
            const { getFacebookStatus } = require('../../api/facebookApi');
            const fbRes = await getFacebookStatus();
            setConnected(fbRes.data.connected);

            // Check Limits
            const res = await checkPhoneNumberLimit();
            setLimitState(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-5 text-center">Checking Workspace Requirements...</div>;
    }

    // SUCCESS SCREEN (STEP 4)
    if (connected) {
        return (
            <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="card shadow border-0 text-center p-5" style={{ maxWidth: 800, borderRadius: '20px' }}>
                    <div className="mb-4 text-success">
                        <i className="bi bi-check-circle-fill" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h2 className="fw-bold text-dark mb-3">WhatsApp Connected Successfully!</h2>
                    <p className="text-muted mb-4">
                        Your WhatsApp Business Account is now linked to Zacx.
                    </p>

                    <div className="bg-light p-4 rounded-3 text-start mb-4">
                        <div className="d-flex justify-content-between mb-2">
                            <span className="fw-bold">Status:</span>
                            <span className="badge bg-success">Active</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span className="fw-bold">Phone Number:</span>
                            <span className="text-muted">Synced from Meta</span>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary btn-lg px-5"
                        onClick={() => navigate('/dashboard')}
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (limitState.isLimitReached) {
        return (
            <div className="container py-5 d-flex justify-content-center">
                <div className="card shadow border-danger" style={{ maxWidth: 500 }}>
                    <div className="card-body text-center p-5">
                        <div className="mb-3 text-danger">
                            <i className="bi bi-exclamation-octagon-fill fs-1"></i>
                        </div>
                        <h4 className="fw-bold text-danger">Phone Number Limit Reached</h4>
                        <p className="text-muted">
                            Your workspace (Free Plan) has reached its limit of <b>{limitState.limit} phone numbers</b>.
                        </p>
                        <hr />
                        <p className="small text-muted mb-4">
                            You currently have {limitState.currentCount} active numbers connected.
                            To add more, please upgrade your plan or contact support.
                        </p>
                        <div className="d-grid gap-2">
                            <button className="btn btn-outline-danger" onClick={() => navigate('/whatsapp/phone-numbers')}>Cancel</button>
                            <a
                                href="https://wa.me/919876543210?text=I%20want%20to%20increase%20my%20phone%20number%20limit"
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-success"
                            >
                                <i className="bi bi-whatsapp me-2"></i> Contact Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Onboarding UI
    return (
        <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="card shadow border-0 text-center p-5" style={{ maxWidth: 800, borderRadius: '20px' }}>
                <div className="mb-4">
                    <p className="text-muted mb-2 small fw-bold text-uppercase">Get Your WhatsApp Business Account in Minutes with Zacx</p>
                    <h2 className="fw-bold text-dark">Please Connect Your Phone Number</h2>
                </div>

                <div className="bg-light p-4 rounded-3 text-start mb-4">
                    <h6 className="fw-bold text-success mb-3">Before you begin:</h6>
                    <ul className="list-unstyled mb-0">
                        <li className="d-flex align-items-start mb-3">
                            <i className="bi bi-check-circle-fill text-success fs-5 me-3 flex-shrink-0"></i>
                            <span className="text-muted">Provide a phone number that is not currently on any WhatsApp app in mobile.</span>
                        </li>
                        <li className="d-flex align-items-start mb-3">
                            <i className="bi bi-check-circle-fill text-success fs-5 me-3 flex-shrink-0"></i>
                            <span className="text-muted">Ensure you can receive calls or SMS on the number you'll provide for verification</span>
                        </li>
                        <li className="d-flex align-items-start mb-3">
                            <i className="bi bi-check-circle-fill text-success fs-5 me-3 flex-shrink-0"></i>
                            <span className="text-muted">Have your business information ready (name, address, website, etc.)</span>
                        </li>
                        <li className="d-flex align-items-start mb-3">
                            <i className="bi bi-check-circle-fill text-success fs-5 me-3 flex-shrink-0"></i>
                            <span className="text-muted">You can migrate your existing WhatsApp number from another service provider to Zacx</span>
                        </li>
                        <li className="d-flex align-items-start">
                            <i className="bi bi-check-circle-fill text-success fs-5 me-3 flex-shrink-0"></i>
                            <span className="text-muted">This setup takes less than 5 minutes to complete with our guided process</span>
                        </li>
                    </ul>
                </div>

                <div className="mb-4 form-check d-inline-block text-start">
                    <input className="form-check-input" type="checkbox" id="termsCheck" defaultChecked />
                    <label className="form-check-label small text-muted" htmlFor="termsCheck">
                        I agree to Zacx <a href="#" className="text-decoration-none">Terms of Service</a> and <a href="#" className="text-decoration-none">Privacy Policy</a>
                    </label>
                </div>

                <div>
                    <button
                        className="btn btn-primary btn-lg px-5 py-3 fw-bold shadow-sm"
                        style={{ backgroundColor: '#6FA4F2', borderColor: '#6FA4F2', fontSize: '1.1rem' }}
                        onClick={() => {
                            const token = localStorage.getItem('token');
                            if (!token) {
                                alert('Authentication error. Please login again.');
                                return;
                            }

                            // 1. Open Popup
                            const width = 600;
                            const height = 700;
                            const left = (window.screen.width - width) / 2;
                            const top = (window.screen.height - height) / 2;

                            const url = `http://localhost:5000/api/facebook/connect-with-token?token=${token}`;
                            window.open(url, 'ConnectOnlyAuth', `width=${width},height=${height},top=${top},left=${left}`);

                            // 2. Listen for Message
                            const handleMessage = (event) => {
                                if (event.data && event.data.type === 'FB_CONNECT_SUCCESS') {
                                    window.removeEventListener('message', handleMessage);
                                    // 3. Success -> Refresh Status
                                    checkStatusAndLimit();
                                }
                            };
                            window.addEventListener('message', handleMessage);
                        }}
                    >
                        <i className="bi bi-facebook me-2"></i> Login with Facebook
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConnectPhoneNumberPage;
