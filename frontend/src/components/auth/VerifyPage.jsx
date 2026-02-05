// src/components/auth/VerifyPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { verifySignup } from '../../api/authApi';

const VerifyPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // State from navigation (Signup)
    const { email, mobile } = location.state || {}; // Expect email and mobile

    const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digit OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!email || !mobile) {
            // Redirect back if accessed directly without state
            navigate('/signup');
        }
    }, [email, mobile, navigate]);

    // Handle OTP Input Change
    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, 6).split('');
        if (data.length > 0) {
            const newOtp = [...otp];
            data.forEach((value, index) => {
                if (index < 6 && !isNaN(value)) newOtp[index] = value;
            });
            setOtp(newOtp);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter a complete 6-digit OTP.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Only sending mobileOTP as per new backend logic
            const res = await verifySignup({
                email,
                mobile,
                mobileOTP: otpValue
                // emailOTP is omitted
            });

            const { token } = res.data;
            if (token) {
                localStorage.setItem('token', token);
                // Force a hard reload or navigate to trigger AuthContext update?
                // Better to simple redirect. App.js will handle the rest.
                window.location.href = '/dashboard'; 
            }
        } catch (err) {
            console.error('Verification failed', err);
            let msg = 'Verification failed.';
            if (err.response?.data?.msg) msg = err.response.data.msg;
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex font-sans">
             {/* Left Side - Marketing with Gradient (Matches Signup) */}
             <div className="d-none d-md-flex col-md-6 flex-column justify-content-center px-5 text-white" 
                 style={{ 
                     background: 'linear-gradient(135deg, #0f5132 0%, #052c65 100%)',
                     position: 'relative'
                 }}>
                 <div className="mb-4">
                    <i className="bi bi-shield-check fs-1 text-success bg-white rounded-circle p-2"></i>
                    <span className="ms-3 fs-3 fw-bold">Zacx™</span>
                </div>
                <h1 className="display-4 fw-bold">
                    Secure your <br/>
                    <span className="text-warning">account.</span>
                </h1>
                <p className="lead mt-3 opacity-75">
                    We take security seriously. Please verify your identity to continue setting up your workspace.
                </p>
            </div>

            {/* Right Side - Verification Form */}
            <div className="col-12 col-md-6 d-flex align-items-center justify-content-center bg-white">
                <div className="p-4" style={{ maxWidth: '450px', width: '100%' }}>
                    <div className="mb-4">
                        <h2 className="fw-bold mb-2">Verify</h2>
                        <p className="text-muted">
                            Enter the code sent to your WhatsApp at <strong className="text-dark">{mobile}</strong>
                        </p>
                    </div>

                    {error && <ErrorMessage message={error} />}

                    <form onSubmit={handleVerify}>
                        <div className="mb-4 d-flex justify-content-between gap-2">
                            {otp.map((data, index) => (
                                <input
                                    className="form-control form-control-lg text-center fw-bold fs-4 border-2"
                                    type="text"
                                    name="otp"
                                    maxLength="1"
                                    key={index}
                                    value={data}
                                    onChange={e => handleChange(e.target, index)}
                                    onPaste={handlePaste}
                                    onFocus={e => e.target.select()}
                                    style={{ width: '50px', height: '60px' }}
                                />
                            ))}
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-secondary w-100 py-3 fw-bold text-white shadow-sm" 
                            style={{ background: '#718096', border: 'none' }} // Greyish teal as per screenshot
                            disabled={loading}
                        >
                            {loading ? <LoadingSpinner size="sm" /> : 'Verify and Continue'}
                        </button>
                    </form>

                    <div className="d-flex justify-content-between mt-4">
                        <button className="btn btn-link text-muted text-decoration-none p-0 small">Change number</button>
                        <button className="btn btn-link text-success fw-bold text-decoration-none p-0 small">Resend Code</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyPage;
