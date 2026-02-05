// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSettings, updateSettings, generateApiKey, revokeApiKey, getTeam, updateMember, deleteMember, inviteMember } from '../api/settingsApi';
import RoleEditor from '../components/settings/RoleEditor';
import InviteMemberModal from '../components/settings/InviteMemberModal';
import PlanBilling from '../components/settings/PlanBilling';
import { getRoles, deleteRole } from '../api/rolesApi';
import { useWorkspace } from '../context/WorkspaceContext';

const SettingsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') || 'workspace';
    const [activeTab, setActiveTab] = useState(tabParam);
    const { refreshWorkspace } = useWorkspace();
    // Roles State
    const [roles, setRoles] = useState([]);
    const [editingRole, setEditingRole] = useState(null);
    const [showRoleEditor, setShowRoleEditor] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Team State
    const [team, setTeam] = useState([]);
    const [teamTab, setTeamTab] = useState('active'); // active | deactivated

    // Load Data
    useEffect(() => {
        if (activeTab === 'team') {
            // fetchRoles(); // Already called in duplicate useEffect? No, check below.
            fetchTeam();
        }
    }, [activeTab]);

    const fetchTeam = async () => {
        try {
            const res = await getTeam();
            setTeam(res.data || []);
        } catch (err) {
            console.error("Failed to fetch team", err);
        }
    };

    const handleUpdateMemberRole = async (userId, newRole) => {
        try {
            await updateMember(userId, { role: newRole });
            fetchTeam();
        } catch (err) {
            alert('Failed to update role');
        }
    };

    const handleDeactivateMember = async (userId) => {
        if (!window.confirm("Deactivate this user? They will lose access.")) return;
        try {
            await updateMember(userId, { status: 'DEACTIVATED' }); // Or 'Deactivated' checking casing
            fetchTeam();
        } catch (err) {
            alert('Failed to deactivate');
        }
    };

    const handleReactivateMember = async (userId) => {
        try {
            await updateMember(userId, { status: 'ACTIVE' });
            fetchTeam();
        } catch (err) {
            alert('Failed to reactivate');
        }
    };

    const handleDeleteMember = async (userId) => {
        if (!window.confirm("Permanently remove this user from the workspace?")) return;
        try {
            await deleteMember(userId);
            fetchTeam();
        } catch (err) {
            alert('Failed to remove member');
        }
    };

    const handleInviteMember = async (data) => {
        await inviteMember(data);
        fetchTeam();
    };

    const activeRoles = roles.filter(r => r.status !== 'DEACTIVATED'); // Filter Active Roles

    // Filter Team
    const filteredTeam = team.filter(m => {
        if (teamTab === 'active') return !m.status || m.status.toUpperCase() === 'ACTIVE'; // Default to active if missing
        return m.status && m.status.toUpperCase() === 'DEACTIVATED';
    });

    // Load Roles
    useEffect(() => {
        if (activeTab === 'team') fetchRoles();
    }, [activeTab]);

    const fetchRoles = async () => {
        try {
            const res = await getRoles();
            setRoles(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditRole = (role) => {
        setEditingRole(role);
        setShowRoleEditor(true);
    };

    const handleNewRole = () => {
        setEditingRole(null);
        setShowRoleEditor(true);
    };

    const handleDeleteRole = async (id) => {
        if (!window.confirm("Are you sure you want to delete this role?")) return;
        try {
            await deleteRole(id);
            fetchRoles();
        } catch (err) {
            alert("Failed to delete role");
        }
    };

    // Local state for editing form
    const [formData, setFormData] = useState({
        name: '',
        timezone: ''
    });

    const [loading, setLoading] = useState(true);
    // Keep full workspace object for other tabs (keys, plan etc)
    const [fullWorkspace, setFullWorkspace] = useState({ apiKeys: [], plan: { type: 'free' } });

    // Sync state with URL
    useEffect(() => {
        if (tabParam) setActiveTab(tabParam);
    }, [tabParam]);

    // Load Data
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await getSettings();
            if (res.data) {
                setFullWorkspace(res.data);
                setFormData({
                    name: res.data.name || '',
                    timezone: res.data.timezone || ''
                });
            }
        } catch (err) {
            console.error('Failed to load settings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    // Feedback state
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSaveWorkspace = async () => {
        try {
            await updateSettings({ name: formData.name, timezone: formData.timezone });
            await refreshWorkspace(); // Update Global Navbar
            setMessage({ type: 'success', text: 'Workspace updated successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to update settings.' });
        }
    };

    const handleGenerateKey = async () => {
        try {
            const res = await generateApiKey();
            setFullWorkspace({ ...fullWorkspace, apiKeys: res.data });
        } catch (err) {
            alert('Error generating key');
        }
    };

    const handleRevokeKey = async (id) => {
        if (!window.confirm('Are you sure you want to revoke this key? integrations may break.')) return;
        try {
            const res = await revokeApiKey(id);
            setFullWorkspace({ ...fullWorkspace, apiKeys: res.data });
        } catch (err) {
            alert('Error revoking key');
        }
    };

    const renderContent = () => {
        if (loading) return <div>Loading Settings...</div>;

        switch (activeTab) {
            case 'workspace':
                return (
                    <div>
                        <h4 className="fw-bold mb-4">Workspace Settings</h4>

                        {message.text && (
                            <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                                {message.text}
                                <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
                            </div>
                        )}

                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Workspace Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <div className="form-text">This name will be visible across your dashboard and reports.</div>
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
                                    <div className="form-text">Used for broadcast scheduling and analytics.</div>
                                </div>
                                <button className="btn btn-primary" onClick={handleSaveWorkspace}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                );


            case 'team':
                return (
                    <div>
                        {/* Title & Add Member */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h4 className="fw-bold mb-1">Team Members</h4>
                                <p className="text-muted small mb-0">Manage your team members and their access.</p>
                            </div>
                            <button className="btn btn-dark btn-sm d-flex align-items-center gap-2" onClick={() => setShowInviteModal(true)}>
                                <i className="bi bi-person-plus-fill"></i> New Member
                            </button>
                        </div>



                        {/* Members Tabs */}
                        <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link rounded-pill small px-3 ${teamTab === 'active' ? 'active' : 'text-muted'}`}
                                    onClick={() => setTeamTab('active')}
                                >
                                    Active Users
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link rounded-pill small px-3 ${teamTab === 'deactivated' ? 'active' : 'text-muted'}`}
                                    onClick={() => setTeamTab('deactivated')}
                                >
                                    Deactivated Users
                                </button>
                            </li>
                        </ul>

                        {/* Members List */}
                        <div className="card shadow-sm mb-5">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-3">Member</th>
                                        <th>Role</th>
                                        <th className="text-end pe-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTeam.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center py-4 text-muted">No members found.</td></tr>
                                    ) : (
                                        filteredTeam.map(member => (
                                            <tr key={member.user._id}>
                                                <td className="ps-3">
                                                    <div className="d-flex align-items-center">
                                                        {member.user.avatar ? (
                                                            <img src={member.user.avatar} className="rounded-circle me-3" width="38" height="38" alt="" />
                                                        ) : (
                                                            <div className="bg-dark text-white rounded-circle d-flex justify-content-center align-items-center me-3" style={{ width: 38, height: 38 }}>
                                                                {member.user.name?.charAt(0).toUpperCase() || 'U'}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h6 className="mb-0 fw-bold">{member.user.name}</h6>
                                                            <small className="text-muted">{member.user.email}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    {member.role === 'Owner' ? (
                                                        <span className="badge bg-light text-dark border">Owner</span>
                                                    ) : (
                                                        <select
                                                            className="form-select form-select-sm"
                                                            style={{ width: 140 }}
                                                            value={member.role}
                                                            onChange={(e) => handleUpdateMemberRole(member.user._id, e.target.value)}
                                                            disabled={teamTab === 'deactivated'}
                                                        >
                                                            {activeRoles.map(role => (
                                                                <option key={role._id} value={role.name}>
                                                                    {role.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>
                                                <td className="text-end pe-3">
                                                    {member.role === 'Owner' ? (
                                                        <button className="btn btn-link text-muted p-0" title="Owner role cannot be modified" disabled>
                                                            <i className="bi bi-lock-fill"></i>
                                                        </button>
                                                    ) : (
                                                        <div className="dropdown">
                                                            <button className="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                                                                <i className="bi bi-three-dots-vertical"></i>
                                                            </button>
                                                            <ul className="dropdown-menu dropdown-menu-end border-0 shadow-sm">
                                                                {teamTab === 'active' ? (
                                                                    <>
                                                                        <li><button className="dropdown-item small" onClick={() => handleDeactivateMember(member.user._id)}><i className="bi bi-person-dash me-2"></i>Deactivate</button></li>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <li><button className="dropdown-item small" onClick={() => handleReactivateMember(member.user._id)}><i className="bi bi-person-check me-2"></i>Reactivate</button></li>
                                                                        <li><hr className="dropdown-divider" /></li>
                                                                        <li><button className="dropdown-item small text-danger" onClick={() => handleDeleteMember(member.user._id)}><i className="bi bi-trash me-2"></i>Remove Permanently</button></li>
                                                                    </>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Roles Section */}
                        <div className="d-flex justify-content-between align-items-center mb-4 mt-5">
                            <div>
                                <h4 className="fw-bold mb-1">Roles</h4>
                                <p className="text-muted small mb-0">Manage permission roles for your team.</p>
                            </div>
                            <button className="btn btn-dark btn-sm d-flex align-items-center gap-2" onClick={handleNewRole}>
                                <i className="bi bi-shield-lock-fill"></i> New Role
                            </button>
                        </div>

                        {/* Roles Tabs */}
                        <ul className="nav nav-pills mb-3">
                            <li className="nav-item">
                                <button className="nav-link active rounded-pill small px-3">Active Roles</button>
                            </li>
                        </ul>

                        {/* Roles List */}
                        <div className="card shadow-sm">
                            <div className="card-body p-0">
                                {roles.length === 0 ? (
                                    <div className="p-4 text-center text-muted">No roles found. Create one.</div>
                                ) : (
                                    roles.map(role => (
                                        <div className="p-3 border-bottom" key={role._id}>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div
                                                    className="d-flex align-items-center gap-3 cursor-pointer flex-grow-1"
                                                    onClick={() => handleEditRole(role)}
                                                >
                                                    <i className="bi bi-toggle-on fs-4 text-success"></i>
                                                    <span className="fw-bold">{role.name}</span>
                                                    <span className="badge bg-light text-dark border rounded-pill">
                                                        {Object.values(role.permissions).filter(Boolean).length} permissions
                                                    </span>
                                                </div>
                                                <div className="dropdown">
                                                    <button className="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                                                        <i className="bi bi-three-dots-vertical"></i>
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-end border-0 shadow-sm">
                                                        <li><button className="dropdown-item small" onClick={() => handleEditRole(role)}><i className="bi bi-pencil me-2"></i>Edit Role</button></li>
                                                        <li><hr className="dropdown-divider" /></li>
                                                        <li><button className="dropdown-item small text-danger" onClick={() => handleDeleteRole(role._id)}><i className="bi bi-trash me-2"></i>Delete Role</button></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Render Editor Modal */}
                        {showRoleEditor && (
                            <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
                                <RoleEditor
                                    role={editingRole}
                                    onClose={() => setShowRoleEditor(false)}
                                    onSave={fetchRoles}
                                />
                            </div>
                        )}

                        <InviteMemberModal
                            isOpen={showInviteModal}
                            onClose={() => setShowInviteModal(false)}
                            onInvite={handleInviteMember}
                            roles={activeRoles}
                        />

                    </div>
                );

            case 'billing':
                return <PlanBilling subscription={fullWorkspace.subscription} />;

            case 'integrations':
                return (
                    <div>
                        <h4 className="fw-bold mb-4">Integrations</h4>
                        <div className="list-group shadow-sm">
                            <div className="list-group-item p-3 d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-slack fs-2 me-3 text-secondary"></i>
                                    <div>
                                        <h6 className="mb-0 fw-bold">Slack</h6>
                                        <p className="mb-0 text-muted small">Receive notifications in your slack channel.</p>
                                    </div>
                                </div>
                                <button className="btn btn-outline-primary btn-sm">Connect</button>
                            </div>
                            <div className="list-group-item p-3 d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-lightning-charge-fill fs-2 me-3 text-warning"></i>
                                    <div>
                                        <h6 className="mb-0 fw-bold">Zapier</h6>
                                        <p className="mb-0 text-muted small">Automate workflows with 5000+ apps.</p>
                                    </div>
                                </div>
                                <button className="btn btn-outline-primary btn-sm">Connect</button>
                            </div>
                            <div className="list-group-item p-3">
                                <h6 className="fw-bold mb-2">Webhooks</h6>
                                <input type="text" className="form-control form-control-sm mb-2" placeholder="https://your-api.com/webhook" />
                                <button className="btn btn-sm btn-success">Save Webhook</button>
                            </div>
                        </div>
                    </div>
                );

            case 'api':
                return (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold mb-0">API Settings</h4>
                            <button className="btn btn-primary btn-sm" onClick={handleGenerateKey}><i className="bi bi-key-fill"></i> Generate New Key</button>
                        </div>

                        <div className="alert alert-warning mb-4">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            Your API keys carry full administrative access. Keep them secret.
                        </div>

                        <div className="card shadow-sm mb-4">
                            <div className="card-body p-0">
                                <table className="table mb-0">
                                    <thead className="bg-light">
                                        <tr><th>Key Token</th><th>Created</th><th>Last Used</th><th>Action</th></tr>
                                    </thead>
                                    <tbody>
                                        {fullWorkspace.apiKeys.length === 0 ? (
                                            <tr><td colSpan="4" className="text-center py-4 text-muted">No API Keys Generated</td></tr>
                                        ) : (
                                            fullWorkspace.apiKeys.map(key => (
                                                <tr key={key._id}>
                                                    <td className="font-monospace">
                                                        {key.key.substring(0, 10)}...****************
                                                        <button className="btn btn-link btn-sm text-secondary" onClick={() => navigator.clipboard.writeText(key.key)} title="Copy"><i className="bi bi-clipboard"></i></button>
                                                    </td>
                                                    <td>{new Date(key.createdAt).toLocaleDateString()}</td>
                                                    <td>{key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}</td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleRevokeKey(key._id)}>Revoke</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-body">
                                <h6>Documentation</h6>
                                <p className="text-muted small">Read our API docs to learn how to integrate programmatically.</p>
                                <a href="#" className="btn btn-link px-0">View API Documentation &rarr;</a>
                            </div>
                        </div>
                    </div>
                );

            default: return <div>Select a setting</div>;
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="row g-4">
                {/* SIDEBAR NAVIGATION */}
                <div className="col-md-3">
                    <div className="card shadow-sm">
                        <div className="card-body p-2">
                            <div className="list-group list-group-flush">
                                {['workspace', 'team', 'billing', 'integrations', 'api'].map(tab => (
                                    <button
                                        key={tab}
                                        className={`list-group-item list-group-item-action border-0 rounded mb-1 ${activeTab === tab ? 'bg-primary text-white' : ''}`}
                                        onClick={() => handleTabChange(tab)}
                                    >
                                        <span className="text-capitalize">{tab === 'billing' ? 'Plan & Billing' : tab}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="col-md-9">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

