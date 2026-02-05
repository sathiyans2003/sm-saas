import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBroadcast, getBroadcastLogs } from '../api/broadcastsApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import moment from 'moment-timezone';

const BroadcastDetailPage = () => {
    const { id } = useParams();
    const [broadcast, setBroadcast] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bRes = await getBroadcast(id);
                setBroadcast(bRes.data);

                // Fetch logs (mock if empty for now since backend might not have populated logs for existing broadcasts)
                try {
                    const lRes = await getBroadcastLogs(id);
                    setLogs(lRes.data);
                } catch (e) {
                    console.warn("Could not fetch logs", e);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="text-center p-5">Loading Analytics...</div>;
    if (!broadcast) return <div className="text-center p-5 text-danger">Broadcast not found</div>;

    // Data for Bar Chart
    const chartData = [
        { name: 'Total', value: broadcast.total, color: '#6366f1' }, // Indigo
        { name: 'Sent', value: broadcast.sent, color: '#f59e0b' },   // Amber
        { name: 'Delivered', value: broadcast.delivered, color: '#10b981' }, // Emerald
        { name: 'Read', value: broadcast.read, color: '#3b82f6' },   // Blue
        { name: 'Replied', value: broadcast.replied, color: '#8b5cf6' }, // Purple
        { name: 'Failed', value: broadcast.failed, color: '#ef4444' }    // Red
    ];

    // Stats Cards Data
    const stats = [
        { label: 'Total Contacts', value: broadcast.total, sub: '', icon: 'bi-people' },
        { label: 'Sent Contacts', value: broadcast.sent, sub: `${((broadcast.sent / (broadcast.total || 1)) * 100).toFixed(1)}%`, icon: 'bi-send' },
        { label: 'Delivered Contacts', value: broadcast.delivered, sub: `${((broadcast.delivered / (broadcast.sent || 1)) * 100).toFixed(1)}%`, icon: 'bi-check-all' },
        { label: 'Read Contacts', value: broadcast.read, sub: `${((broadcast.read / (broadcast.delivered || 1)) * 100).toFixed(1)}%`, icon: 'bi-eye' },
        { label: 'Replied Contacts', value: broadcast.replied, sub: `${((broadcast.replied / (broadcast.read || 1)) * 100).toFixed(1)}%`, icon: 'bi-reply' },
        { label: 'Failed Contacts', value: broadcast.failed, sub: `${((broadcast.failed / (broadcast.total || 1)) * 100).toFixed(1)}%`, icon: 'bi-x-circle' },
    ];

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb small mb-1">
                            <li className="breadcrumb-item"><Link to="/broadcasts" className="text-decoration-none text-muted">Broadcasts</Link></li>
                            <li className="breadcrumb-item active" aria-current="page">{broadcast.name}</li>
                        </ol>
                    </nav>
                    <h4 className="fw-bold mb-0">{broadcast.name} <span className="text-muted fw-normal fs-6 ms-2">({moment(broadcast.createdAt).format('DD/MM/YYYY, hh:mm A')})</span></h4>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}><i className="bi bi-printer me-2"></i>Export</button>
                    <button className="btn btn-success btn-sm"><i className="bi bi-whatsapp me-2"></i>Send Report</button>
                </div>
            </div>

            {/* Top Section: Chart & Stats */}
            <div className="row g-4 mb-4">
                {/* Left: Bar Chart */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 py-3">
                            <h6 className="fw-bold mb-0 text-secondary">Broadcast Performance</h6>
                            <small className="text-muted">Delivery Status of Messages</small>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right: Stats Grid */}
                <div className="col-lg-7">
                    <div className="row g-3">
                        {stats.map((stat, idx) => (
                            <div className="col-md-4 col-sm-6" key={idx}>
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h6 className="text-muted small text-uppercase mb-0">{stat.label}</h6>
                                            <i className={`bi ${stat.icon} text-muted`}></i>
                                        </div>
                                        <h3 className="fw-bold mb-1">{stat.value}</h3>
                                        <small className="text-success fw-medium">{stat.sub}</small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Broadcast Details Row */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom py-3">
                    <h6 className="fw-bold mb-0">Broadcast Details</h6>
                </div>
                <div className="card-body">
                    <div className="row g-4">
                        <div className="col-md-3">
                            <label className="text-muted small text-uppercase d-block mb-1">Audience</label>
                            <div className="d-flex align-items-center">
                                <div className="bg-light rounded-circle p-2 me-2"><i className="bi bi-people text-primary"></i></div>
                                <div>
                                    <div className="fw-bold">{broadcast.audienceType === 'TAG' ? 'Tag-based' : 'All Contacts'}</div>
                                    <small className="text-muted">{broadcast.targetCount} Recipients</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="text-muted small text-uppercase d-block mb-1">From Number</label>
                            <div className="d-flex align-items-center">
                                <div className="bg-light rounded-circle p-2 me-2"><i className="bi bi-whatsapp text-success"></i></div>
                                <div>
                                    <div className="fw-bold">Marketing</div>
                                    <small className="text-muted">+91 86676 79002</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="text-muted small text-uppercase d-block mb-1">Template</label>
                            <div className="d-flex align-items-center">
                                <div className="bg-light rounded-circle p-2 me-2"><i className="bi bi-file-text text-warning"></i></div>
                                <div>
                                    <div className="fw-bold">{broadcast.templateName || 'Custom Message'}</div>
                                    <div className="small text-muted text-truncate" style={{ maxWidth: '150px' }}>
                                        <button className="btn btn-link p-0 text-decoration-none small">View Template</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="text-muted small text-uppercase d-block mb-1">Performance</label>
                            <div className="d-flex justify-content-between small mb-1">
                                <span>Delivery Rate</span>
                                <span className="fw-bold text-success">{((broadcast.delivered / (broadcast.sent || 1)) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="d-flex justify-content-between small">
                                <span>Read Rate</span>
                                <span className="fw-bold text-primary">{((broadcast.read / (broadcast.delivered || 1)) * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Reports Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0">Delivery Reports</h6>
                    <div className="d-flex gap-2">
                        <button className="btn btn-light btn-sm border">Download All Reports</button>
                        <button className="btn btn-dark btn-sm">Download Sent Report</button>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light small text-uppercase text-muted">
                                <tr>
                                    <th className="ps-4">Name</th>
                                    <th>Phone Number</th>
                                    <th>Sent At</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5 text-muted">
                                            No detailed logs available for this broadcast.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-4 fw-medium">{log.contactId?.name || 'Unknown'}</td>
                                            <td>{log.contactId?.phone || '-'}</td>
                                            <td className="text-muted small">{moment(log.timestamp).format('DD/MM/YYYY, hh:mm A')}</td>
                                            <td>
                                                <span className={`badge rounded-pill bg-light border ${log.status === 'READ' ? 'text-primary border-primary' :
                                                        log.status === 'DELIVERED' ? 'text-success border-success' :
                                                            log.status === 'FAILED' ? 'text-danger border-danger' :
                                                                'text-secondary border-secondary'
                                                    }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BroadcastDetailPage;
