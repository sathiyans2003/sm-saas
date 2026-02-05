// src/components/layout/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { workspace, workspaces, switchWorkspace } = useWorkspace();
    const { user, logout } = useAuth();
    const currentBusinessName = workspace?.name || "Loading...";

    const zacxLogo = "https://via.placeholder.com/30x30/004d40/ffffff?text=Z";

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm py-2">
            <div className="container-fluid">

                {/* Left */}
                <div className="d-flex align-items-center me-auto">
                    <Link className="navbar-brand d-flex align-items-center me-3" to="/dashboard">
                        <img src={zacxLogo} alt="Zacx Logo" width="30" height="30" className="me-2" />
                        <span className="fw-bold text-dark">SM</span>
                    </Link>

                    <div className="dropdown me-3">
                        <button
                            className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center bg-white border-0 shadow-sm px-3"
                            type="button"
                            data-bs-toggle="dropdown"
                            style={{ minWidth: '200px' }}
                        >
                            {/* Icon generated from Initials or Image */}
                            <div className="bg-dark text-white rounded me-2 d-flex align-items-center justify-content-center fw-bold" style={{ width: 24, height: 24, fontSize: 12 }}>
                                {currentBusinessName?.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="fw-medium text-truncate" style={{ maxWidth: '150px' }}>{currentBusinessName}</span>
                        </button>
                        <ul className="dropdown-menu shadow-lg border-0 p-2" style={{ minWidth: '260px' }}>
                            <li className="mb-2">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                                    <input type="text" className="form-control bg-light border-start-0" placeholder="Search workspaces..." />
                                </div>
                            </li>

                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {workspaces.map(ws => (
                                    <li key={ws._id}>
                                        <button
                                            className="dropdown-item d-flex align-items-center justify-content-between rounded py-2 my-1"
                                            onClick={() => switchWorkspace(ws._id)}
                                        >
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light text-muted border rounded me-2 d-flex align-items-center justify-content-center fw-bold small" style={{ width: 24, height: 24 }}>
                                                    {ws.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className={`${ws._id === workspace?._id ? 'fw-bold' : ''}`}>{ws.name}</span>
                                            </div>
                                            {ws._id === workspace?._id && <i className="bi bi-check-lg text-success"></i>}
                                        </button>
                                    </li>
                                ))}
                            </div>

                            <li><hr className="dropdown-divider my-2" /></li>
                            <li>
                                <Link className="dropdown-item d-flex align-items-center gap-2 text-muted small" to="/account/workspaces">
                                    <i className="bi bi-grid"></i> All workspaces
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Center */}
                <ul className="navbar-nav mx-auto">
                    <li className="nav-item mx-2">
                        <a className="nav-link" href="/dashboard">Dashboard</a>
                    </li>
                    <li className="nav-item mx-2">
                        <a className="nav-link" href="/chats">Chats</a>
                    </li>
                    <li className="nav-item mx-2">
                        <a className="nav-link" href="/contacts">Contacts</a>
                    </li>
                    <li className="nav-item mx-2">
                        <a className="nav-link" href="/broadcasts">Broadcasts</a>
                    </li>
                    <li className="nav-item mx-2">
                        <a className="nav-link" href="/automations">Automations</a>
                    </li>
                    <li className="nav-item mx-2">
                        <a className="nav-link" href="/whatsapp">WhatsApp Features</a>
                    </li>
                    {['Owner', 'Admin'].includes(workspace?.currentUserRole) && (
                        <li className="nav-item mx-2">
                            <a className="nav-link" href="/settings">Settings</a>
                        </li>
                    )}
                </ul>

                {/* Right */}
                <div className="d-flex align-items-center">
                    <button className="btn btn-link position-relative me-3">
                        <i className="bi bi-bell fs-5"></i>
                        <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">3</span>
                    </button>

                    <div className="dropdown">
                        <button
                            className="btn btn-link dropdown-toggle d-flex align-items-center gap-2 text-decoration-none"
                            data-bs-toggle="dropdown"
                        >
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Profile" className="rounded-circle border" width="32" height="32" style={{ objectFit: 'cover' }} />
                            ) : (
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li className="px-3 py-2 border-bottom">
                                <div className="fw-bold">{user?.name}</div>
                                <small className="text-muted">{user?.email}</small>
                            </li>
                            <li><Link className="dropdown-item mt-2" to="/settings?tab=team">Team</Link></li>
                            <li><Link className="dropdown-item" to="/settings?tab=billing">Billing</Link></li>
                            <li><Link className="dropdown-item" to="/account/workspaces">My Workspaces</Link></li>
                            <li><Link className="dropdown-item" to="/profile">My Profile</Link></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button
                                    className="dropdown-item text-danger"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </nav>
    );
};

export default Navbar;
