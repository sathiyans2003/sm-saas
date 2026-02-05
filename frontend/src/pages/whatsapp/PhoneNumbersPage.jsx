// src/pages/whatsapp/PhoneNumbersPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPhoneNumbers } from '../../api/whatsappApi';

const PhoneNumbersPage = () => {
    const [numbers, setNumbers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupedNumbers, setGroupedNumbers] = useState({});

    useEffect(() => {
        loadNumbers();
    }, []);

    const loadNumbers = async () => {
        try {
            const res = await getPhoneNumbers();
            const data = res.data;
            setNumbers(data);

            // Group by WABA ID
            const grouped = data.reduce((acc, num) => {
                const waba = num.wabaId || 'UNKNOWN_WABA'; // Fallback
                if (!acc[waba]) acc[waba] = [];
                acc[waba].push(num);
                return acc;
            }, {});
            setGroupedNumbers(grouped);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getQualityBadge = (rating) => {
        const colors = {
            GREEN: 'success',
            YELLOW: 'warning',
            RED: 'danger',
            UNKNOWN: 'secondary'
        };
        return <span className={`badge rounded-pill bg-${colors[rating] || 'secondary'}`}>{rating || 'UNKNOWN'}</span>;
    };

    // Modal State
    const [modalState, setModalState] = useState({ type: null, number: null });
    const [otpCode, setOtpCode] = useState('');
    const [pin, setPin] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);

    const openModal = (type, number) => {
        setModalState({ type, number });
        setOtpCode('');
        setPin('');
        setIsOtpSent(false);
    };

    const closeModal = () => {
        setModalState({ type: null, number: null });
    };

    // Handle Form Submissions
    const handleModalSubmit = async () => {
        const { requestAuthCode, registerNumber, setTwoStepVerification, deleteNumber } = require('../../api/whatsappApi');
        const phoneNumberId = modalState.number?.phoneNumberId;

        // 1. REGISTER FLOW
        if (modalState.type === 'REGISTER') {
            try {
                if (!isOtpSent) {
                    // Send Code
                    await requestAuthCode({ phoneNumberId, method: 'SMS' });
                    setIsOtpSent(true);
                    alert('Verification code sent to your phone!');
                } else {
                    // Verify Code
                    await registerNumber({ phoneNumberId, code: otpCode });
                    alert('Number registered successfully!');
                    closeModal();
                    handleRefresh();
                }
            } catch (err) {
                console.error(err);
                alert('Action failed: ' + (err.response?.data?.error?.message || err.message));
            }
            return;
        }

        // 2. SET 2FA
        if (modalState.type === '2FA') {
            try {
                await setTwoStepVerification({ phoneNumberId, pin });
                alert('2FA PIN set successfully!');
                closeModal();
            } catch (err) {
                console.error(err);
                alert('Failed to set PIN: ' + (err.response?.data?.error?.message || err.message));
            }
            return;
        }

        // 3. DELETE
        if (modalState.type === 'DELETE') {
            try {
                await deleteNumber(phoneNumberId);
                alert('Number removed successfully!');
                closeModal();
                handleRefresh();
            } catch (err) {
                console.error(err);
                alert('Failed to delete number.');
            }
            return;
        }

        // 4. RE-ONBOARD (Mock for now, typically same as Register)
        if (modalState.type === 'REONBOARD') {
            alert('Re-onboard initiated. Please check your Facebook Business Manager.');
            closeModal();
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const { syncPhoneNumbers } = require('../../api/whatsappApi');
            await syncPhoneNumbers();
            await loadNumbers(); // Reload list after sync
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4 position-relative">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">Phone Numbers</h4>
                    <p className="text-muted small mb-0">Manage your WhatsApp Business API numbers.</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2" onClick={handleRefresh}>
                        <i className="bi bi-arrow-repeat"></i> Sync Now
                    </button>
                    <Link to="/whatsapp/connect-number" className="btn btn-dark btn-sm d-flex align-items-center gap-2">
                        <i className="bi bi-plus-lg"></i> Add New Number
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5 text-muted">Loading Numbers...</div>
            ) : Object.keys(groupedNumbers).length === 0 ? (
                <div className="text-center py-5 border rounded bg-light">
                    <p className="text-muted mb-0">No phone numbers found.</p>
                </div>
            ) : (
                Object.keys(groupedNumbers).map(wabaId => (
                    <div key={wabaId} className="card shadow-sm mb-4">
                        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="fw-bold mb-1">WABA ID: {wabaId}</h6>
                                <small className="text-muted">Business Account</small>
                            </div>
                            <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                                onClick={() => window.open(`https://business.facebook.com/wa/manage/phone-numbers/?waba_id=${wabaId}`, '_blank')}
                            >
                                WhatsApp Manager <i className="bi bi-box-arrow-up-right"></i>
                            </button>
                        </div>
                        <div className="table-responsive" style={{ overflow: 'visible' }}>
                            <table className="table align-middle mb-0">
                                <thead className="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="ps-3 border-0">Display Name</th>
                                        <th className="border-0">Phone Number</th>
                                        <th className="border-0">Phone Number ID</th>
                                        <th className="border-0">Messaging Limit</th>
                                        <th className="border-0">Quality Rating</th>
                                        <th className="text-end pe-3 border-0">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedNumbers[wabaId].map(num => (
                                        <tr key={num.id || num._id} style={{ transform: 'translate3d(0,0,0)' }}>
                                            <td className="ps-3 fw-medium">{num.verified_name || num.display_phone_number}</td>
                                            <td>{num.display_phone_number}</td>
                                            <td className="font-monospace small text-muted">{num.phoneNumberId || num.id}</td>
                                            <td><span className="badge bg-light text-dark border">{num.messaging_limit || 'TIER_250'}</span></td>
                                            <td>{getQualityBadge(num.quality_rating)}</td>
                                            <td className="text-end pe-3">
                                                <div className="dropdown">
                                                    <button
                                                        className="btn btn-link text-muted p-0"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                        style={{ position: 'relative' }}
                                                    >
                                                        <i className="bi bi-three-dots-vertical"></i>
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2"
                                                        style={{ minWidth: '200px', position: 'fixed', zIndex: 1050 }}
                                                    >
                                                        <li><button className="dropdown-item small py-2 d-flex align-items-center" onClick={() => openModal('REGISTER', num)}><i className="bi bi-plus-lg me-3 text-muted"></i>Register Number</button></li>
                                                        <li><button className="dropdown-item small py-2 d-flex align-items-center" onClick={() => openModal('2FA', num)}><i className="bi bi-shield-lock me-3 text-muted"></i>Set 2FA</button></li>
                                                        <li><button className="dropdown-item small py-2 d-flex align-items-center" onClick={() => openModal('REONBOARD', num)}><i className="bi bi-facebook me-3 text-muted"></i>Re-onboard</button></li>
                                                        <li><hr className="dropdown-divider my-1" /></li>
                                                        <li><button className="dropdown-item small py-2 d-flex align-items-center" onClick={handleRefresh}><i className="bi bi-arrow-repeat me-3 text-muted"></i>Sync Status</button></li>
                                                        <li><div className="dropdown-divider my-1"></div></li>
                                                        <li><button className="dropdown-item small py-2 d-flex align-items-center text-danger" onClick={() => openModal('DELETE', num)}><i className="bi bi-trash me-3"></i>Delete</button></li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}

            {/* SHARED MODAL COMPONENT */}
            {modalState.type && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content border-0 shadow-lg">
                                <div className="modal-header">
                                    <h5 className="modal-title fw-bold">
                                        {modalState.type === 'REGISTER' && 'Register Number'}
                                        {modalState.type === '2FA' && 'Set Two-Step Verification'}
                                        {modalState.type === 'REONBOARD' && 'Re-onboard Number'}
                                        {modalState.type === 'DELETE' && 'Delete Number'}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={closeModal}></button>
                                </div>
                                <div className="modal-body">

                                    {modalState.type === 'REGISTER' && (
                                        <div>
                                            <p className="small text-muted mb-3">Register this phone number to send messages via WhatsApp API.</p>
                                            <div className="mb-3">
                                                <label className="form-label small fw-bold">Phone Number</label>
                                                <input type="text" className="form-control bg-light" value={modalState.number?.display_phone_number} disabled />
                                            </div>
                                            <div className="alert alert-info small"><i className="bi bi-info-circle me-2"></i>You will receive a 6-digit code via SMS/Voice.</div>
                                        </div>
                                    )}

                                    {modalState.type === '2FA' && (
                                        <div>
                                            <p className="small text-muted mb-3">Set a 6-digit PIN to secure your WhatsApp account.</p>
                                            <div className="mb-3">
                                                <label className="form-label small fw-bold">Enter 6-digit PIN</label>
                                                <input type="password" className="form-control" maxLength="6" placeholder="******" />
                                            </div>
                                        </div>
                                    )}

                                    {modalState.type === 'REONBOARD' && (
                                        <div>
                                            <p className="text-muted">Are you sure you want to re-onboard <strong>{modalState.number?.display_phone_number}</strong>?</p>
                                            <p className="small text-danger">This will re-trigger the embedded signup flow.</p>
                                        </div>
                                    )}

                                    {modalState.type === 'DELETE' && (
                                        <div>
                                            <p className="text-danger fw-medium">Are you sure you want to delete this number?</p>
                                            <p className="text-muted small"><strong>{modalState.number?.display_phone_number}</strong> will be removed from your dashboard. This cannot be undone.</p>
                                        </div>
                                    )}

                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={closeModal}>Cancel</button>
                                    <button type="button" className={`btn ${modalState.type === 'DELETE' ? 'btn-danger' : 'btn-primary'}`} onClick={handleModalSubmit}>
                                        {modalState.type === 'REGISTER' && 'Register'}
                                        {modalState.type === '2FA' && 'Set PIN'}
                                        {modalState.type === 'REONBOARD' && 'Re-onboard'}
                                        {modalState.type === 'DELETE' && 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PhoneNumbersPage;
