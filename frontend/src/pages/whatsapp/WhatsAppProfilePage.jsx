// src/pages/whatsapp/WhatsAppProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { getProfile } from '../../api/whatsappApi';
import { useAuth } from '../../context/AuthContext'; // Import Global Auth

const WhatsAppProfilePage = () => {
    const { user, refreshUser } = useAuth(); // Global User State

    const [profile, setProfile] = useState({
        displayName: 'Heguru India',
        displayNameStatus: 'APPROVED',
        category: 'Education',
        about: '',
        address: '',
        description: '',
        email: '',
        websites: [''],
        profile_picture_url: '',
        phoneNumber: '+91 63850 33427'
    });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // State for Blue Tick Modal
    const [showBlueTickModal, setShowBlueTickModal] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    // Sync Global User Avatar to Local State whenever it changes
    useEffect(() => {
        if (user && user.profile_image) {
            setProfile(prev => ({ ...prev, profile_picture_url: user.profile_image }));
        }
    }, [user]);

    const loadProfile = async () => {
        try {
            const res = await getProfile();
            setProfile(prev => ({
                ...prev,
                ...res.data,
                // Prioritize global image if available, else local/fetched
                profile_picture_url: user?.profile_image || res.data.profile_picture_url || prev.profile_picture_url
            }));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const { uploadProfileImage } = require('../../api/whatsappApi');
            const res = await uploadProfileImage(formData);

            // 1. Update Local State Immediate
            setProfile({ ...profile, profile_picture_url: res.data.profile_image });

            // 2. Refresh Global State (Syncs with Sidebar, Header, etc.)
            await refreshUser();

        } catch (err) {
            console.error('Upload failed', err);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = () => {
        alert('Profile Updated Successfully!');
    };

    // Helper for Character Count
    const CharCount = ({ current, max }) => (
        <div className="text-end text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
            {current?.length || 0}/{max}
        </div>
    );

    return (
        <div className="container-fluid py-4 bg-light" style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Header */}
            <div className="mb-4">
                <h4 className="fw-bold text-dark">WhatsApp Profile</h4>
            </div>

            <div className="row">
                {/* LEFT COLUMN - EDITOR */}
                <div className="col-lg-8">

                    {/* Top Cards */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body d-flex align-items-center">
                                    <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3" style={{ width: 48, height: 48 }}>
                                        <i className="bi bi-whatsapp fs-4"></i>
                                    </div>
                                    <div>
                                        <h5 className="fw-bold mb-0">{profile.phoneNumber}</h5>
                                        <small className="text-muted">You are currently editing this number</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div
                                className="card shadow-sm border-0 h-100 pointer hover-bg-light"
                                onClick={() => setShowBlueTickModal(true)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="card-body d-flex align-items-center">
                                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: 48, height: 48 }}>
                                        <i className="bi bi-patch-check-fill fs-4"></i>
                                    </div>
                                    <div>
                                        <h5 className="fw-bold mb-0">Apply For Blue Tick</h5>
                                        <small className="text-muted">Click here to apply for Blue tick</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Form */}
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            {loading ? <p>Loading...</p> : (
                                <form>
                                    {/* Display Name */}
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <label className="form-label fw-medium text-muted small mb-0">Display name <span className="text-success fw-bold ms-1">{profile.displayNameStatus}</span></label>
                                        </div>
                                        <div className="input-group">
                                            <input type="text" className="form-control bg-light" value={profile.displayName} disabled />
                                            <button className="btn btn-outline-secondary bg-white" type="button">Edit Display Name</button>
                                        </div>
                                    </div>

                                    {/* Profile Photo */}
                                    <div className="mb-4">
                                        <label className="form-label fw-medium text-muted small">Profile photo</label>
                                        <div className="border rounded p-3 d-flex align-items-center bg-white">
                                            {profile.profile_picture_url ? (
                                                <img src={profile.profile_picture_url} alt="Profile" className="rounded-circle me-3 border" width="60" height="60" style={{ objectFit: 'cover' }} />
                                            ) : (
                                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3 text-muted" style={{ width: 60, height: 60 }}>
                                                    <i className="bi bi-person-fill fs-3"></i>
                                                </div>
                                            )}
                                            <div className="flex-grow-1">
                                                <input type="file" className="form-control form-control-sm" onChange={handleFileChange} accept="image/*" />
                                                {uploading && <small className="text-muted">Uploading...</small>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-4">
                                        <label className="form-label fw-medium text-muted small">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            name="description"
                                            value={profile.description}
                                            onChange={handleChange}
                                            maxLength={512}
                                        ></textarea>
                                        <CharCount current={profile.description} max={512} />
                                    </div>

                                    {/* Category & Address Row */}
                                    <div className="row mb-4">
                                        <div className="col-md-5">
                                            <label className="form-label fw-medium text-muted small">Category</label>
                                            <select className="form-select" name="category" value={profile.category} onChange={handleChange}>
                                                <option value="Education">Education</option>
                                                <option value="Retail">Retail</option>
                                                <option value="Finance">Finance</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-md-7">
                                            <label className="form-label fw-medium text-muted small">Address</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="address"
                                                value={profile.address}
                                                onChange={handleChange}
                                                maxLength={256}
                                            />
                                            <CharCount current={profile.address} max={256} />
                                        </div>
                                    </div>

                                    {/* Email & Website Row */}
                                    <div className="row mb-5">
                                        <div className="col-md-5">
                                            <label className="form-label fw-medium text-muted small">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                value={profile.email}
                                                onChange={handleChange}
                                                maxLength={128}
                                            />
                                            <CharCount current={profile.email} max={128} />
                                        </div>
                                        <div className="col-md-7">
                                            <label className="form-label fw-medium text-muted small">Website</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={profile.websites[0]}
                                                onChange={(e) => setProfile({ ...profile, websites: [e.target.value] })}
                                                maxLength={256}
                                            />
                                            <CharCount current={profile.websites[0]} max={256} />
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <button
                                        type="button"
                                        className="btn btn-success w-100 text-white fw-bold py-2 shadow-sm"
                                        onClick={handleSave}
                                        style={{ backgroundColor: '#2E7D32' }}
                                    >
                                        Save
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - PREVIEW */}
                <div className="col-lg-4">
                    <div className="text-center mb-3">
                        <h6 className="fw-bold text-muted">Profile Preview</h6>
                    </div>

                    {/* Phone Mockup Frame */}
                    <div className="bg-white rounded-4 shadow p-3 mx-auto" style={{ maxWidth: '340px', border: '1px solid #e0e0e0' }}>
                        {/* Header */}
                        <div className="d-flex align-items-center mb-4 text-muted">
                            <i className="bi bi-arrow-left fs-5 me-auto"></i>
                            <i className="bi bi-three-dots-vertical fs-5"></i>
                        </div>

                        {/* Profile Content */}
                        <div className="text-center mb-4">
                            <div className="position-relative d-inline-block mb-3">
                                <img
                                    src={profile.profile_picture_url || 'https://via.placeholder.com/150'}
                                    className="rounded-circle border"
                                    width="100"
                                    height="100"
                                    alt="Profile"
                                    style={{ objectFit: 'cover', padding: '2px' }}
                                />
                            </div>
                            <h4 className="fw-bold mb-0 text-dark">{profile.displayName || 'Business Name'}</h4>
                            <p className="text-muted small mb-3">{profile.phoneNumber}</p>

                            {/* Share Button */}
                            <button className="btn btn-outline-secondary btn-sm rounded-pill px-4 py-1" style={{ fontSize: '0.8rem' }}>
                                <i className="bi bi-share me-2"></i>Share
                            </button>
                        </div>

                        {/* List Items */}
                        <div className="px-2 pb-4">
                            {/* Description */}
                            <div className="d-flex mb-3">
                                <i className="bi bi-shop text-muted fs-5 me-3 mt-1"></i>
                                <div className="text-start">
                                    <p className="mb-0 text-muted small" style={{ fontSize: '0.9rem' }}>
                                        {profile.description || 'Your business description will appear here.'}
                                    </p>
                                </div>
                            </div>

                            {/* Category */}
                            <div className="d-flex mb-3">
                                <i className="bi bi-grid text-muted fs-5 me-3"></i>
                                <div className="text-start">
                                    <p className="mb-0 text-muted small">{profile.category}</p>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="d-flex mb-3">
                                <i className="bi bi-geo-alt text-muted fs-5 me-3"></i>
                                <div className="text-start">
                                    <p className="mb-0 text-primary small text-decoration-none">
                                        {profile.address || 'Your Location with street address will appear here.'}
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="d-flex mb-3">
                                <i className="bi bi-envelope text-muted fs-5 me-3"></i>
                                <div className="text-start">
                                    <a href={`mailto:${profile.email}`} className="mb-0 text-primary small text-decoration-none text-break">
                                        {profile.email || 'email@example.com'}
                                    </a>
                                </div>
                            </div>

                            {/* Website */}
                            <div className="d-flex">
                                <i className="bi bi-globe text-muted fs-5 me-3"></i>
                                <div className="text-start">
                                    <a href={profile.websites[0]} className="mb-0 text-primary small text-decoration-none text-break">
                                        {profile.websites[0] || 'https://website.com'}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BLUE TICK MODAL */}
            {showBlueTickModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1050,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="bg-white rounded-3 shadow p-4 text-center" style={{ maxWidth: '600px', width: '90%' }}>
                        <div className="d-flex mb-4">
                            <div className="flex-grow-1 text-start">
                                <h5 className="fw-bold mb-1">
                                    Apply for WhatsApp Official Business Account (Blue Tick)
                                    <i className="bi bi-patch-check-fill text-primary ms-2"></i>
                                </h5>
                                <small className="text-muted">You need to apply directly from your Meta Business Manager.</small>
                            </div>
                            <button type="button" className="btn-close" onClick={() => setShowBlueTickModal(false)}></button>
                        </div>

                        <div className="py-5">
                            <div className="mb-3">
                                <i className="bi bi-camera-video text-warning display-4"></i>
                            </div>
                            <h4 className="fw-bold mb-2">Tutorial Video Coming Soon</h4>
                            <p className="text-muted mb-4 px-5">
                                We are currently working on a tutorial video to guide you on how to apply for blue tick to your whatsapp number, Until then you can contact us for any queries using the below button
                            </p>

                            <a
                                href="https://business.facebook.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary px-4 py-2 fw-bold"
                            >
                                <i className="bi bi-box-arrow-up-right me-2"></i>
                                Go to WhatsApp Manager
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhatsAppProfilePage;
