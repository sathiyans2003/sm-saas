// src/components/dashboard/MessagingAnalytics.jsx
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useWorkspace } from '../../context/WorkspaceContext';
import moment from 'moment-timezone';

const MessagingAnalytics = ({ analyticsData, summary }) => {
    // Current active tab: 'analytics' (We can extend this later if needed)
    const [activeTab, setActiveTab] = useState('analytics');
    const { workspace } = useWorkspace();

    if (!analyticsData || analyticsData.length === 0) {
        return (
            <div className="dashboard-card p-4 h-100 d-flex justify-content-center align-items-center text-muted">
                No data available for the selected period
            </div>
        );
    }

    // Use passed summary or calculate from data if missing
    const displaySummary = summary || { sent: 0, delivered: 0, read: 0, readRate: '0%' };

    // Calculate read rate if not provided 
    if (!summary) {
        const totalSent = analyticsData.reduce((sum, item) => sum + (item.sent || 0), 0);
        const totalRead = analyticsData.reduce((sum, item) => sum + (item.read || 0), 0);
        displaySummary.sent = totalSent;
        displaySummary.read = totalRead;
        displaySummary.readRate = totalSent > 0 ? ((totalRead / totalSent) * 100).toFixed(1) + '%' : '0.0%';
    }

    const formatDate = (dateStr) => {
        const tz = workspace?.timezone || 'UTC';
        return moment(dateStr).tz(tz).format('DD MMM');
    };

    return (
        <div className="card shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Messaging Analytics</h5>
            </div>

            {activeTab === 'analytics' && (
                <>
                    <div className="mb-3 d-flex gap-4">
                        <div className="text-muted small">Total Sent <span className="fw-bold text-dark d-block fs-5">{displaySummary.sent}</span></div>
                        <div className="text-muted small">Total Delivered <span className="fw-bold text-dark d-block fs-5">{displaySummary.delivered}</span></div>
                        <div className="text-muted small">Delivery Rate <span className="fw-bold text-success d-block fs-5">{displaySummary.readRate}</span></div>
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={analyticsData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={formatDate} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip
                                cursor={{ stroke: '#cccccc', strokeWidth: 1 }}
                                labelFormatter={formatDate}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                payload={[
                                    { value: 'Sent', type: 'circle', id: 'sent', color: '#007bff' },
                                    { value: 'Delivered', type: 'circle', id: 'delivered', color: '#28a745' },
                                    { value: 'Read', type: 'circle', id: 'read', color: '#fd7e14' },
                                ]}
                            />
                            <Line type="monotone" dataKey="sent" name="Sent" stroke="#007bff" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="delivered" name="Delivered" stroke="#28a745" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="read" name="Read" stroke="#fd7e14" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </>
            )}
        </div>
    );
};

export default MessagingAnalytics;
