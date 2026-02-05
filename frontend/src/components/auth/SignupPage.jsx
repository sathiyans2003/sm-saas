// src/components/auth/SignupPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { initiateSignup } from '../../api/authApi';

const SignupPage = () => {
    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInitiate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            await initiateSignup({
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile,
                password: formData.password
            });
            // Move to Verify Page passing state
            navigate('/verify', {
                state: {
                    email: formData.email,
                    mobile: formData.mobile,
                    source: 'signup'
                }
            });
        } catch (err) {
            console.error(err);
            let errorMsg = 'Failed to initiate signup.';
            if (err.response?.data?.msg) errorMsg = err.response.data.msg;
            if (err.response?.data?.errors) errorMsg = err.response.data.errors[0].msg;
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex min-vh-100 font-sans">
            {/* Left Side - Marketing with Gradient (Professional Green Theme) */}
            <div className="d-none d-md-flex col-md-6 flex-column justify-content-center px-5 text-white"
                style={{
                    background: 'linear-gradient(135deg, #0f5132 0%, #052c65 100%)', // Dark Green/Blue professional gradient
                    position: 'relative',
                    overflow: 'hidden'
                }}>

                {/* Decorative Circle */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)'
                }} />

                <div style={{ zIndex: 1 }}>
                    <div className="mb-4">
                        <i className="bi bi-whatsapp fs-1 text-success bg-white rounded-circle p-2"></i>
                        <span className="ms-3 fs-3 fw-bold">Zacx™</span>
                    </div>

                    <h1 className="display-4 fw-bold mb-4">
                        Turn conversations <br />
                        <span className="text-success" style={{ color: '#25D366 !important' }}>into revenue.</span>
                    </h1>

                    <p className="lead mb-4 opacity-75">
                        Zacx is your all-in-one WhatsApp platform to grow and scale your business.
                        From chat to CRM to campaigns and automations.
                    </p>

                    <div className="d-flex flex-column gap-3 fs-5">
                        <div className="d-flex align-items-center">
                            <i className="bi bi-check-circle-fill text-success me-3"></i>
                            Simple
                        </div>
                        <div className="d-flex align-items-center">
                            <i className="bi bi-check-circle-fill text-success me-3"></i>
                            Scalable
                        </div>
                        <div className="d-flex align-items-center">
                            <i className="bi bi-check-circle-fill text-success me-3"></i>
                            Reliable
                        </div>
                    </div>

                    <div className="mt-5 text-white-50 small">
                        © 2026 Zapkaro Technologies LLP. Powering modern enterprise communication.
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="col-12 col-md-6 d-flex align-items-center justify-content-center bg-light">
                <div className="p-4 p-md-5 w-100" style={{ maxWidth: '500px' }}>
                    <div className="text-center mb-4 d-md-none">
                        <h2 className="fw-bold text-success">Zacx™</h2>
                    </div>

                    <h2 className="fw-bold mb-2">Continue to Zacx</h2>
                    <p className="text-muted mb-4">Enter your details to create your account.</p>

                    {error && <ErrorMessage message={error} />}

                    <form onSubmit={handleInitiate}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Full Name</label>
                            <input
                                type="text"
                                className="form-control form-control-lg bg-white"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Your Name"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Email Address</label>
                            <input
                                type="email"
                                className="form-control form-control-lg"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="name@company.com"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">WhatsApp Number</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    🇮🇳 +91
                                </span>
                                <input
                                    type="text"
                                    className="form-control form-control-lg border-start-0 ps-0"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    required
                                    placeholder="98765 43210"
                                />
                            </div>
                            <div className="form-text text-danger">
                                <i className="bi bi-info-circle me-1"></i>
                                If you are logging in for the first time, please do not enter the WhatsApp number that you are going to connect for API.
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-6">
                                <label className="form-label fw-semibold">Password</label>
                                <input
                                    type="password"
                                    className="form-control form-control-lg"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="******"
                                />
                            </div>
                            <div className="col-6">
                                <label className="form-label fw-semibold">Confirm</label>
                                <input
                                    type="password"
                                    className="form-control form-control-lg"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="******"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-success w-100 py-3 fw-bold shadow-sm"
                            style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                            disabled={loading}
                        >
                            {loading ? <LoadingSpinner size="sm" /> : (
                                <>
                                    Get Code on WhatsApp <i className="bi bi-arrow-right ms-2"></i>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-4 text-center text-muted small">
                        By continuing, you agree to our Terms, Privacy Policy and Refund Policy.
                    </div>

                    <div className="text-center mt-3">
                        Already have an account? <Link to="/login" className="text-success fw-bold text-decoration-none">Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;