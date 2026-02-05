// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import MessagingAnalytics from '../components/dashboard/MessagingAnalytics';
import TemplateManagement from '../components/templates/TemplateManagement';
import { fetchDashboardMetrics } from '../api/dashboardApi';

import UpgradeBanner from '../components/UpgradeBanner';

const DashboardPage = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    // Default Date Range: Last 30 Days
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadMetrics();
    }, [dateRange]);

    const loadMetrics = async () => {
        setLoading(true);
        try {
            const res = await fetchDashboardMetrics(dateRange.startDate, dateRange.endDate);
            setMetrics(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !metrics) {
        return <div className="p-5 text-center">Loading Dashboard...</div>;
    }

    const { stats, typeDistribution, analytics } = metrics || {};

    const COLORS = ['#007bff', '#fd7e14', '#28a745']; // Marketing, Utility, Auth
    return (
        <div className="container-fluid py-4">
            <UpgradeBanner />
            <h2 className="mb-4 fw-bold">Dashboard Overview</h2>

            {/* TOP CARDS ROW */}
            <div className="row g-3 mb-4">
                {[
                    { label: 'Total Sent', value: stats?.sent, color: 'primary', icon: 'bi-send' },
                    { label: 'Delivered', value: stats?.delivered, color: 'success', icon: 'bi-check-all' },
                    { label: 'Read', value: stats?.read, color: 'info', icon: 'bi-eye' },
                    { label: 'Failed', value: stats?.failed, color: 'danger', icon: 'bi-exclamation-circle' },
                    { label: 'Cost ($)', value: stats?.cost?.toFixed(2), color: 'warning', icon: 'bi-currency-dollar' },
                ].map((card, idx) => (
                    <div className="col-md" key={idx}>
                        <div className={`card shadow-sm border-start border-4 border-${card.color} h-100`}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <h6 className="text-muted text-uppercase mb-0 small fw-bold">{card.label}</h6>
                                    <i className={`bi ${card.icon} text-${card.color} fs-5`}></i>
                                </div>
                                <h3 className="fw-bold mb-0">{card.value || 0}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row">
                {/* Analytics Section */}
                <div className="col-lg-8 mb-4">
                    <MessagingAnalytics analyticsData={analytics} summary={stats} />
                </div>

                {/* Template Distribution Section */}
                <div className="col-lg-4 mb-4">
                    <div className="card shadow-sm h-100 p-3">
                        <h5 className="mb-3 fw-bold">Template Distribution</h5>

                        <div style={{ height: '250px' }}>
                            {typeDistribution && typeDistribution.reduce((a, b) => a + b.value, 0) > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={typeDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {typeDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                                    No Data
                                </div>
                            )}
                        </div>

                        {/* Custom Legend List */}
                        <ul className="list-group list-group-flush mt-3">
                            {typeDistribution && typeDistribution.map((type, idx) => (
                                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <span>
                                        <span className="dot d-inline-block rounded-circle me-2" style={{ width: 10, height: 10, backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                        {type.name}
                                    </span>
                                    <span className="badge rounded-pill bg-light text-dark border">
                                        {type.value}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;