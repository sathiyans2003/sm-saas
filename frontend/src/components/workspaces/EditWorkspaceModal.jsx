import React, { useState, useEffect } from 'react';
import { updateSettings } from '../../api/settingsApi';
import { useWorkspace } from '../../context/WorkspaceContext';

const EditWorkspaceModal = ({ show, onClose, workspaceData, onSuccess }) => {
    const { refreshWorkspace } = useWorkspace();
    const [formData, setFormData] = useState({
        name: '',
        timezone: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (workspaceData) {
            setFormData({
                name: workspaceData.name,
                timezone: workspaceData.timezone
            });
        }
    }, [workspaceData]);

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await updateSettings({ name: formData.name, timezone: formData.timezone });
            await refreshWorkspace(); // Refresh global context
            setMessage({ type: 'success', text: 'Workspace updated successfully!' });

            // Close after short delay to show success
            setTimeout(() => {
                onSuccess();
                onClose();
                setMessage(null);
            }, 1000);
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to update workspace.' });
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title fw-bold">Edit Workspace</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {message && (
                            <div className={`alert alert-${message.type} py-2 small`}>{message.text}</div>
                        )}

                        <div className="mb-3">
                            <label className="form-label">Workspace Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Time Zone</label>
                            <select
                                className="form-select"
                                value={formData.timezone}
                                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                            >
                                <option value="UTC">GMT+00:00 – UTC</option>
                                <option value="Asia/Kolkata">GMT+05:30 – Asia/Kolkata (IST)</option>
                                <option value="America/New_York">GMT-05:00 – America/New_York (EST)</option>
                                <option value="Europe/London">GMT+00:00 – Europe/London (GMT)</option>
                                <option value="Australia/Sydney">GMT+11:00 – Australia/Sydney (AEDT)</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
                        <button
                            type="button"
                            className="btn btn-success text-white"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditWorkspaceModal;
