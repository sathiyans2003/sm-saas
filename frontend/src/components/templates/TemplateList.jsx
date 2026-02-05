// src/components/templates/TemplateList.jsx
import React, { useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const TemplateList = ({ templates, loading, error, onViewDetail, onEditTemplate, onDeleteTemplate }) => {
    const [searchTerm, setSearchTerm] = useState(''); // Not used here, but for filtering within the list

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!templates || templates.length === 0) {
        return <div className="alert alert-info text-center mt-4">No templates found.</div>;
    }

    const filteredTemplates = templates.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">All Templates</h5>
                <input
                    type="text"
                    className="form-control form-control-sm w-25"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Language</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTemplates.map((template) => (
                                <tr key={template.id}>
                                    <td>{template.name}</td>
                                    <td>
                                        <span className={`badge bg-${template.category === 'Marketing' ? 'info' : template.category === 'Utility' ? 'primary' : 'warning'}`}>
                                            {template.category}
                                        </span>
                                    </td>
                                    <td>{template.language}</td>
                                    <td>
                                        <span className={`badge bg-${template.status === 'Approved' ? 'success' : template.status === 'Pending' ? 'warning' : 'danger'}`}>
                                            {template.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex">
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onViewDetail(template.id)}>
                                                <i className="bi bi-eye"></i> View
                                            </button>
                                            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => onEditTemplate(template.id)}>
                                                <i className="bi bi-pencil"></i> Edit
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => onDeleteTemplate(template.id)}>
                                                <i className="bi bi-trash"></i> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Pagination can be added here if needed */}
        </div>
    );
};

export default TemplateList;