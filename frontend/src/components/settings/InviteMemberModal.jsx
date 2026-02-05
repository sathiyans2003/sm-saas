import React, { useState } from 'react';

const InviteMemberModal = ({ isOpen, onClose, onInvite, roles }) => {
    const [phone, setPhone] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!phone || !selectedRole) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            await onInvite({ phone, role: selectedRole });
            onClose();
            setPhone('');
            setSelectedRole('');
        } catch (err) {
            console.error(err);
            alert("Failed to invite member");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="card shadow-lg" style={{ width: '500px' }}>
                <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                    <h5 className="fw-bold mb-1">Add Team Member</h5>
                    <p className="text-muted small">Enter phone number and select role.</p>
                </div>
                <div className="card-body px-4 pb-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label small fw-bold">Phone Number</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    🇮🇳 +91
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="00000 00000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label small fw-bold">Role</label>
                            <select
                                className="form-select"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                <option value="">Select a role</option>
                                {roles.map(role => (
                                    <option key={role._id} value={role.name}>{role.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-light" onClick={onClose} disabled={loading}>Cancel</button>
                            <button type="submit" className="btn btn-success px-4" disabled={loading}>
                                {loading ? 'Inviting...' : 'Invite'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InviteMemberModal;
