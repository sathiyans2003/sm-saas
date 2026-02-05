// src/components/templates/TemplateForm.jsx
import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage'; // ✅ Path corrected here

const TemplateForm = ({ template = {}, mode = 'create', onSubmit, onCancel, loading, error, message }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Utility', // Default category
        language: 'en_US', // Default language
        body: '',
        variables: '', // Comma separated string for simplicity
    });

    useEffect(() => {
        if (mode === 'edit' && template && template.id) {
            setFormData({
                name: template.name || '',
                category: template.category || 'Utility',
                language: template.language || 'en_US',
                body: template.body || '',
                variables: template.variables?.join(', ') || '',
            });
        }
    }, [mode, template]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSend = {
            ...formData,
            variables: formData.variables.split(',').map(v => v.trim()).filter(Boolean), // Convert to array
        };
        onSubmit(dataToSend);
    };

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{mode === 'create' ? 'Create New Template' : `Edit Template: ${template.name}`}</h5>
                <button className="btn btn-sm btn-secondary" onClick={onCancel}>
                    <i className="bi bi-x-lg"></i> Cancel
                </button>
            </div>
            <div className="card-body">
                {loading && <LoadingSpinner />}
                {error && <ErrorMessage message={error} />}
                {message && message.type && message.content && (
                    <div className={`alert alert-${message.type}`} role="alert">
                        {message.content}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Template Name *</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="category" className="form-label">Category *</label>
                        <select
                            className="form-select"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="Utility">Utility</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Authentication">Authentication</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="language" className="form-label">Language *</label>
                        <select
                            className="form-select"
                            id="language"
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            required
                        >
                            <option value="en_US">English (US)</option>
                            <option value="ta">Tamil</option>
                            <option value="es">Español</option>
                            {/* Add more languages as needed */}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="body" className="form-label">Template Body *</label>
                        <textarea
                            className="form-control"
                            id="body"
                            name="body"
                            rows="4"
                            value={formData.body}
                            onChange={handleChange}
                            placeholder="e.g., Hi {{1}}, your order {{2}} has been confirmed!"
                            required
                        ></textarea>
                        <div className="form-text">Use {'{{1}}'}, {'{{2}}'} for dynamic variables.</div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="variables" className="form-label">Variables (Comma Separated)</label>
                        <input
                            type="text"
                            className="form-control"
                            id="variables"
                            name="variables"
                            value={formData.variables}
                            onChange={handleChange}
                            placeholder="e.g., Customer Name, Order ID"
                        />
                        <div className="form-text">List the names of your variables in order, separated by commas.</div>
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                        <button type="button" className="btn btn-secondary me-2" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {mode === 'create' ? 'Create Template' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TemplateForm;