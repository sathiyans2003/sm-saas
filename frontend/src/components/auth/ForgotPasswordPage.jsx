import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { forgotPassword } from '../../api/authApi';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            console.error('Forgot password failed:', err);
            setError(err.response?.data?.msg || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="card-body">
                    <h2 className="card-title text-center mb-4">Forgot Password</h2>

                    <p className="text-center text-muted mb-4">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    {loading && <LoadingSpinner />}
                    {error && <ErrorMessage message={error} />}
                    {success && (
                        <div className="alert alert-success" role="alert">
                            If an account exists with that email, a password reset link has been sent.
                        </div>
                    )}

                    {!success && (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required />
                            </div>

                            <div className="d-grid gap-2 mb-3">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </div>
                        </form>
                    )}

                    <p className="text-center mt-3">
                        <Link to="/login">Back to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
