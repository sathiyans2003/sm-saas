import React, { useState } from 'react';
import { createWorkspace } from '../../api/settingsApi';
import { useWorkspace } from '../../context/WorkspaceContext';

const CreateWorkspaceModal = ({ show, onClose }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const { fetchWorkspacesList } = useWorkspace(); // To reload list after create

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createWorkspace({ name });
            await fetchWorkspacesList(); // Reload workspace list
            onClose();
            setName('');
        } catch (err) {
            console.error(err);
            alert('Failed to create workspace');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Create New Workspace</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Workspace Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. My Business Name"
                                    required
                                />
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Workspace'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateWorkspaceModal;
