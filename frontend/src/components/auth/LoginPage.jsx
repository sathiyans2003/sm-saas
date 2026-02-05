// src/components/auth/LoginPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { login } from '../../api/authApi';

const LoginPage = ({ onAuthChange }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 🔥 REAL BACKEND LOGIN CALL
            // const navigate = useNavigate();
            const response = await login(formData);

            console.log('Login success:', response.data);

            // JWT token store
            localStorage.setItem('token', response.data.token);

            // Update auth state
            if (onAuthChange) onAuthChange(true);

            // Redirect (Hard Reload to ensure Navbar rendering)
            window.location.href = '/dashboard';
        } catch (err) {
            console.error('Login failed:', err);

            let errorMsg = 'Invalid email or password';
            if (err.response && err.response.data && err.response.data.msg) {
                errorMsg = err.response.data.msg;
            }

            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="card-body">
                    <h2 className="card-title text-center mb-4">Login to Zacx</h2>

                    {loading && <LoadingSpinner />}
                    {error && <ErrorMessage message={error} />}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email address</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <div className="input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="********"
                                    required
                                />
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                </button>
                            </div>
                            <div className="d-flex justify-content-end mt-1">
                                <Link to="/forgot-password" style={{ fontSize: '0.9rem', textDecoration: 'none' }}>Forgot Password?</Link>
                            </div>
                        </div>

                        <div className="d-grid gap-2 mb-3">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </div>

                        <p className="text-center">
                            Don't have an account? <Link to="/signup">Sign up</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
