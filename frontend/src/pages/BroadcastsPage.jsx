// src/pages/BroadcastsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBroadcasts } from '../api/broadcastsApi';
import CreateBroadcastModal from '../components/broadcasts/CreateBroadcastModal';
import { useWorkspace } from '../context/WorkspaceContext';
import moment from 'moment-timezone';

const BroadcastsPage = () => {
    // 🔥 REAL DATA
    const [broadcasts, setBroadcasts] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const { workspace } = useWorkspace();

    const loadBroadcasts = () => {
        fetchBroadcasts()
            .then(res => setBroadcasts(res.data))
            .catch(console.error);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const tz = workspace?.timezone || 'UTC';
        return moment(dateString).tz(tz).format('DD MMM YYYY, hh:mm A');
    };

    useEffect(() => {
        loadBroadcasts();
    }, []);

    const getStatusBadge = (status) => {
        if (status === 'Sent') return <span className="badge rounded-pill border border-success text-success bg-light fw-normal px-3">Sent</span>;
        if (status === 'Stopped') return <span className="badge rounded-pill border border-secondary text-secondary bg-light fw-normal px-3">Stopped</span>;
        return <span className="badge bg-secondary">{status}</span>;
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0">WhatsApp Broadcasts</h4>
                <button className="btn btn-success text-white" onClick={() => setShowCreate(true)}>
                    + New Broadcast
                </button>
            </div>

            <div className="mb-3 d-flex justify-content-end">
                <input
                    type="text"
                    className="form-control w-auto"
                    placeholder="Search..."
                    style={{ minWidth: '250px' }}
                />
            </div>

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="text-muted small text-uppercase">
                                <th className="ps-3 py-3" style={{ fontWeight: 600 }}>Name</th>
                                <th style={{ fontWeight: 600 }}>Total</th>
                                <th style={{ fontWeight: 600 }}>Sent</th>
                                <th style={{ fontWeight: 600 }}>Delivered</th>
                                <th style={{ fontWeight: 600 }}>Read</th>
                                <th style={{ fontWeight: 600 }}>Replied</th>
                                <th style={{ fontWeight: 600 }}>Failed</th>
                                <th style={{ fontWeight: 600 }}>Status</th>
                                <th style={{ fontWeight: 600 }}>Date & Time</th>
                                <th className="text-end pe-4" style={{ fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {broadcasts.map(b => (
                                <tr key={b.id}>
                                    <td className="ps-3 py-3 fw-medium text-dark">{b.name}</td>
                                    <td>{b.total}</td>
                                    <td>{b.sent}</td>
                                    <td>{b.delivered}</td>
                                    <td>{b.read}</td>
                                    <td>{b.replied}</td>
                                    <td>{b.failed}</td>
                                    <td>{getStatusBadge(b.status)}</td>
                                    <td className="text-muted small">{formatDate(b.date)}</td>
                                    <td className="text-end pe-4">
                                        <Link to={`/broadcasts/${b._id || b.id}`} className="btn btn-sm btn-link text-primary p-0">
                                            <i className="bi bi-eye h5 m-0"></i>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-end align-items-center p-3 border-top">
                    <span className="text-muted small me-3">Rows per page</span>
                    <select className="form-select form-select-sm w-auto me-4">
                        <option>10</option>
                        <option>20</option>
                    </select>
                    <span className="text-muted small me-3">Page 1 of 1</span>
                    <div className="btn-group">
                        <button className="btn btn-sm btn-outline-light text-secondary border">«</button>
                        <button className="btn btn-sm btn-outline-light text-secondary border">‹</button>
                        <button className="btn btn-sm btn-outline-light text-secondary border">›</button>
                        <button className="btn btn-sm btn-outline-light text-secondary border">»</button>
                    </div>
                </div>
            </div>
            {/* CREATE MODAL */}
            <CreateBroadcastModal
                show={showCreate}
                onClose={() => setShowCreate(false)}
                onSuccess={loadBroadcasts}
            />
        </div>
    );
};

export default BroadcastsPage;