// src/components/templates/TemplateDetail.jsx
import React from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const TemplateDetail = ({ template, loading, error, onBackToList, onEditTemplate }) => {
    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!template) {
        return <div className="alert alert-info text-center mt-4">Template details not found.</div>;
    }

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Template: {template.name}</h5>
                <div>
                    <button className="btn btn-sm btn-secondary me-2" onClick={onBackToList}>
                        <i className="bi bi-arrow-left"></i> Back to List
                    </button>
                    <button className="btn btn-sm btn-primary" onClick={() => onEditTemplate(template.id)}>
                        <i className="bi bi-pencil"></i> Edit Template
                    </button>
                </div>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-6">
                        <p><strong>ID:</strong> {template.id}</p>
                        <p><strong>Category:</strong> <span className={`badge bg-${template.category === 'Marketing' ? 'info' : template.category === 'Utility' ? 'primary' : 'warning'}`}>{template.category}</span></p>
                        <p><strong>Language:</strong> {template.language}</p>
                        <p><strong>Status:</strong> <span className={`badge bg-${template.status === 'Approved' ? 'success' : template.status === 'Pending' ? 'warning' : 'danger'}`}>{template.status}</span></p>
                        <p><strong>Body:</strong> <code>{template.body}</code></p>
                        <p><strong>Variables:</strong> {template.variables?.join(', ') || 'N/A'}</p>
                        <p><strong>Created At:</strong> {new Date(template.createdAt).toLocaleString()}</p>
                        <p><strong>Last Updated:</strong> {new Date(template.updatedAt).toLocaleString()}</p>
                    </div>
                    <div className="col-md-6">
                        <h6>Preview:</h6>
                        <div className="border p-3 rounded bg-light mb-3" style={{ minHeight: '100px' }}>
                            {template.previews && template.previews.length > 0 ? (
                                template.previews.map((preview, index) => (
                                    <p key={index} className="text-muted small">{preview}</p>
                                ))
                            ) : (
                                <p className="text-muted small">No previews available.</p>
                            )}
                        </div>

                        <h6>Performance Metrics:</h6>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                Sent: <span className="badge bg-primary rounded-pill">{template.performance?.sent || 0}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                Delivered: <span className="badge bg-success rounded-pill">{template.performance?.delivered || 0}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                Read: <span className="badge bg-info rounded-pill">{template.performance?.read || 0}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                Read Rate: <span className="badge bg-dark rounded-pill">{template.performance?.readRate || '0%'}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                Impressions: <span className="badge bg-secondary rounded-pill">{template.performance?.impressions || 0}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                Clicks: <span className="badge bg-warning rounded-pill">{template.performance?.clicks || 0}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                CTR (Click-Through Rate): <span className="badge bg-danger rounded-pill">{template.performance?.ctr || '0%'}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateDetail;