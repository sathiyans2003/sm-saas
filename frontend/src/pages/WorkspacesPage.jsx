// src/pages/WorkspacesPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateWorkspaceModal from '../components/workspaces/CreateWorkspaceModal';
import EditWorkspaceModal from '../components/workspaces/EditWorkspaceModal';
import { useWorkspace } from '../context/WorkspaceContext';

const WorkspacesPage = () => {
    const navigate = useNavigate();
    // Get list of workspaces from context
    const { workspaces, switchWorkspace, loading } = useWorkspace();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingWorkspace, setEditingWorkspace] = useState(null);

    const handleEdit = (ws) => {
        setEditingWorkspace(ws);
        setShowEditModal(true);
    };

    const handleSelect = (id) => {
        switchWorkspace(id);
        navigate('/dashboard');
    };

    // Force redirection to create workspace if none exist
    React.useEffect(() => {
        if (!loading && workspaces.length === 0) {
            navigate('/create-workspace');
        }
    }, [loading, workspaces, navigate]);

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold">Good Evening!</h2>
                    <p className="text-muted">Manage your workspaces and client accounts</p>
                </div>
                <button
                    className="btn btn-success pointer"
                    onClick={() => setShowCreateModal(true)}
                >
                    + Create Workspace
                </button>
            </div>

            {/* Filter Bar (UI only) */}
            <div className="card mb-4 border-0 shadow-sm">
                <div className="card-body d-flex gap-3 align-items-center">
                    <button className="btn btn-light"><i className="bi bi-grid"></i></button>
                    <button className="btn btn-light"><i className="bi bi-list"></i></button>
                    <input type="text" className="form-control" placeholder="Search workspaces..." style={{ maxWidth: '300px' }} />
                    <div className="ms-auto d-flex gap-2">
                        <select className="form-select w-auto"><option>All Status</option></select>
                        <select className="form-select w-auto"><option>Newest First</option></select>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* REAL WORKSPACE CARDS */}
                {loading ? (
                    <div className="col-12 text-center py-5">Loading Workspaces...</div>
                ) : workspaces.length > 0 ? (
                    workspaces.map(ws => (
                        <div className="col-md-4" key={ws._id}>
                            <div className="card h-100 border-0 shadow-sm p-3 border-start border-4 border-primary">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="bg-light p-2 rounded text-primary"><i className="bi bi-briefcase-fill fs-4"></i></div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <h5 className="mb-0 fw-bold text-truncate" title={ws.name}>{ws.name}</h5>
                                            <small className="text-muted">ID: {ws._id.substring(0, 8)}...</small>
                                        </div>
                                    </div>
                                    <div className="dropdown">
                                        <button className="btn btn-link text-secondary p-0" data-bs-toggle="dropdown"><i className="bi bi-three-dots-vertical"></i></button>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><button className="dropdown-item" onClick={() => handleEdit(ws)}>Edit Settings</button></li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <span className="badge bg-light text-success border border-success">Active</span>
                                    <span className="badge bg-light text-secondary border ms-2">{ws.plan?.type?.toUpperCase() || 'FREE'}</span>
                                </div>

                                <div className="text-muted small mb-4">
                                    <div className="mb-1">👑 Current User (Owner)</div>
                                    <div>🕒 {ws.timezone}</div>
                                </div>

                                <div className="mt-auto d-flex gap-2">
                                    <button
                                        className="btn btn-outline-primary btn-sm flex-grow-1"
                                        onClick={() => handleSelect(ws._id)}
                                    >
                                        Open Dashboard
                                    </button>
                                    <button
                                        className="btn btn-light btn-sm border"
                                        onClick={() => handleEdit(ws)}
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center text-muted">
                        No workspaces found. Create one to get started!
                        <br />
                        <button className="btn btn-primary mt-3" onClick={() => setShowCreateModal(true)}>Create Your First Workspace</button>
                    </div>
                )}


            </div>

            <EditWorkspaceModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                workspace={editingWorkspace}
                onUpdate={() => {
                    // Refresh logic handles by context usually, or we can trigger a reload
                    window.location.reload();
                }}
            />

            <CreateWorkspaceModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </div>
    );
};


export default WorkspacesPage;
