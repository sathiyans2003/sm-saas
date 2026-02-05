import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { refreshUser } = useAuth(); // Global auth refresh
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        timezone: 'UTC',
        whatsappNumber: '',
        email: '',
        avatar: '',
        whatsappVerified: false,
        emailVerified: false
    });

    // Message states for each section
    const [basicInfoMsg, setBasicInfoMsg] = useState(null);
    const [whatsappMsg, setWhatsappMsg] = useState(null);
    const [emailMsg, setEmailMsg] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await getProfile();
            setUser(res.data);
        } catch (err) {
            console.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBasicInfo = async () => {
        setBasicInfoMsg(null);
        try {
            await updateProfile({
                firstName: user.firstName,
                lastName: user.lastName,
                timezone: user.timezone
            });
            await refreshUser(); // Update navbar immediately
            setBasicInfoMsg({ type: 'success', text: 'Basic info updated successfully!' });
            setTimeout(() => setBasicInfoMsg(null), 3000);
        } catch (err) {
            setBasicInfoMsg({ type: 'danger', text: 'Failed to update.' });
        }
    };

    const handleUpdateWhatsApp = async () => {
        setWhatsappMsg(null);
        try {
            await updateProfile({ whatsappNumber: user.whatsappNumber });
            // WhatsApp update doesn't usually affect global navbar name/avatar, but good practice
            await refreshUser();
            setWhatsappMsg({ type: 'success', text: 'WhatsApp number updated!' });
            setTimeout(() => setWhatsappMsg(null), 3000);
        } catch (err) {
            setWhatsappMsg({ type: 'danger', text: 'Failed to update.' });
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Use the unified upload API
            const { uploadProfileImage } = require('../api/whatsappApi');
            const res = await uploadProfileImage(formData);

            // Update local state and global context
            const newUrl = res.data.profile_image;
            setUser(prev => ({ ...prev, profile_image: newUrl, avatar: newUrl }));
            await refreshUser();
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.msg || "Failed to upload image. Please try again.";
            alert(errorMsg);
        }
    };

    if (loading) return <div className="p-5 text-center">Loading Profile...</div>;

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'User';

    return (
        <div className="container-fluid p-0">
            {/* HERDER SECTION WITH AVATAR */}
            <div className="bg-light position-relative mb-5" style={{ height: '200px', backgroundColor: '#e9ecef' }}>
                <div className="position-absolute bottom-0 start-50 translate-middle text-center" style={{ marginBottom: '-60px' }}>
                    <div className="mb-2">
                        <span className="fs-4 fw-bold">{user.name}</span>
                    </div>
                    <div className="position-relative d-inline-block">
                        {user.profile_image || user.avatar ? (
                            <img
                                src={user.profile_image || user.avatar}
                                alt="Profile"
                                className="rounded-circle border border-4 border-white shadow-sm"
                                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="rounded-circle border border-4 border-white shadow-sm bg-primary text-white d-flex align-items-center justify-content-center mx-auto" style={{ width: '120px', height: '120px', fontSize: '40px' }}>
                                {fullName.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <label className="position-absolute bottom-0 end-0 bg-dark text-white rounded-circle p-2 pointer shadow-sm" style={{ cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-camera-fill small"></i>
                            <input type="file" className="d-none" accept="image/*" onChange={handleAvatarChange} />
                        </label>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '80px', maxWidth: '800px' }}>

                {/* 1. BASIC INFORMATION */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                        <h6 className="fw-bold"><i className="bi bi-person me-2"></i>Basic Information</h6>
                    </div>
                    <div className="card-body">
                        {basicInfoMsg && <div className={`alert alert-${basicInfoMsg.type} py-2`}>{basicInfoMsg.text}</div>}
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small text-muted">First Name <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={user.firstName}
                                    onChange={e => setUser({ ...user, firstName: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small text-muted">Last Name <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={user.lastName}
                                    onChange={e => setUser({ ...user, lastName: e.target.value })}
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label small text-muted">Your Timezone <span className="text-danger">*</span></label>
                                <select
                                    className="form-select"
                                    value={user.timezone}
                                    onChange={e => setUser({ ...user, timezone: e.target.value })}
                                >
                                    <option value="UTC">GMT+00:00 – UTC</option>
                                    <option value="Asia/Kolkata">GMT+05:30 – Asia/Kolkata (IST)</option>
                                    <option value="America/New_York">GMT-05:00 – America/New_York (EST)</option>
                                    <option value="Europe/London">GMT+00:00 – Europe/London (GMT)</option>
                                </select>
                                <div className="form-text small">This helps us show chats and dates in your local time</div>
                            </div>
                            <div className="col-12 text-end">
                                <button className="btn btn-secondary btn-sm" onClick={handleUpdateBasicInfo}>Update Changes</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. WHATSAPP NUMBER */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0"><i className="bi bi-whatsapp me-2 text-success"></i>WhatsApp Number</h6>
                        <span className={`badge rounded-pill border ${user.whatsappVerified ? 'border-success text-success' : 'border-warning text-warning'} bg-light fw-normal`}>
                            {user.whatsappVerified ? 'Verified' : 'Requires verification'}
                        </span>
                    </div>
                    <div className="card-body">
                        {whatsappMsg && <div className={`alert alert-${whatsappMsg.type} py-2`}>{whatsappMsg.text}</div>}

                        <div className="input-group mb-2">
                            <span className="input-group-text bg-light border-end-0">🇮🇳</span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                value={user.whatsappNumber}
                                onChange={e => setUser({ ...user, whatsappNumber: e.target.value })}
                                placeholder="+91 90000 00000"
                            />
                        </div>
                        <div className="form-text small mb-3">Your WhatsApp number will be used for important notifications and Login OTPs</div>

                        <div className="text-end">
                            <button className="btn btn-success text-white btn-sm" onClick={handleUpdateWhatsApp}>Verify & Update</button>
                        </div>
                    </div>
                </div>

                {/* 3. EMAIL ADDRESS */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0"><i className="bi bi-envelope me-2"></i>Email Address</h6>
                        <span className={`badge rounded-pill border ${user.emailVerified ? 'border-success text-success' : 'border-warning text-warning'} bg-light fw-normal`}>
                            {user.emailVerified ? 'Verified' : 'Requires verification'}
                        </span>
                    </div>
                    <div className="card-body">
                        <input type="email" className="form-control mb-2" value={user.email} disabled />
                        <div className="form-text small mb-3">Your email will be used for account-related communications and fallback OTPs</div>
                        <div className="text-end">
                            <button className="btn btn-secondary btn-sm" disabled>Update</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
