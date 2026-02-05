import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWorkspace } from '../api/settingsApi';
import { useWorkspace } from '../context/WorkspaceContext';

const CreateWorkspacePage = () => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const { fetchWorkspacesList, switchWorkspace } = useWorkspace();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Create Workspace
            const res = await createWorkspace({ name });
            const newWorkspace = res.data;

            // 2. Refresh List
            await fetchWorkspacesList();

            // 3. Switch to it (simulates selecting it)
            // switchWorkspace usually expects an ID.
            if (newWorkspace && newWorkspace._id) {
                await switchWorkspace(newWorkspace._id);
                // 4. Go to Dashboard
                navigate('/dashboard');
            } else {
                // Fallback if return is structure differently
                navigate('/account/workspaces');
            }

        } catch (err) {
            console.error("Creation failed", err);
            alert('Failed to create workspace. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="card shadow-lg border-0 p-4" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="text-center mb-4">
                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                        <i className="bi bi-rocket-takeoff-fill fs-3"></i>
                    </div>
                    <h2 className="fw-bold">Welcome aboard!</h2>
                    <p className="text-muted">
                        Let's set up your first workspace to get you started.
                        A workspace is where you manage your team and resources.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="form-label fw-bold">Workspace Name</label>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Acme Corp, My Agency"
                            required
                            autoFocus
                        />
                        <div className="form-text">You can change this later in settings.</div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 mb-3"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Setting up...
                            </>
                        ) : (
                            'Create Workspace'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateWorkspacePage;
