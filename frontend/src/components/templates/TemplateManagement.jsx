// src/components/templates/TemplateManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import templateService from '../../api/templates'; // Adjust path as needed
import TemplateList from './TemplateList';
import TemplateDetail from './TemplateDetail';
import TemplateForm from './TemplateForm';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const TemplateManagement = () => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'create', 'edit'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formMessage, setFormMessage] = useState({ type: '', content: '' }); // For form specific messages

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await templateService.getAllTemplates(); // Assuming getAllTemplates returns { templates: [], total: ... }
            setTemplates(data.templates);
        } catch (err) {
            setError('Failed to fetch templates. Please try again.');
            console.error('Fetch templates error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleViewDetail = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const template = await templateService.getTemplateById(id);
            setSelectedTemplate(template);
            setViewMode('detail');
        } catch (err) {
            setError(`Failed to fetch template details for ${id}.`);
            console.error('Fetch template detail error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCreateTemplate = useCallback(() => {
        setSelectedTemplate(null); // Clear any previous selection
        setViewMode('create');
        setFormMessage({ type: '', content: '' });
    }, []);

    const handleEditTemplate = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const template = await templateService.getTemplateById(id);
            setSelectedTemplate(template);
            setViewMode('edit');
            setFormMessage({ type: '', content: '' });
        } catch (err) {
            setError(`Failed to load template for editing: ${err.message}`);
            console.error('Edit template error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSubmitTemplate = useCallback(async (templateData) => {
        setLoading(true);
        setError(null);
        setFormMessage({ type: 'info', content: 'Saving template...' });
        try {
            if (viewMode === 'create') {
                await templateService.createTemplate(templateData);
                setFormMessage({ type: 'success', content: 'Template created successfully!' });
            } else if (viewMode === 'edit' && selectedTemplate?.id) {
                await templateService.updateTemplate(selectedTemplate.id, templateData);
                setFormMessage({ type: 'success', content: 'Template updated successfully!' });
            }
            await fetchTemplates(); // Refresh the list
            setViewMode('list'); // Go back to list view
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to save template.';
            setError(msg); // Set general error for submission failure
            setFormMessage({ type: 'danger', content: msg }); // Set form specific error
            console.error('Submit template error:', err);
        } finally {
            setLoading(false);
        }
    }, [viewMode, selectedTemplate, fetchTemplates]);

    const handleDeleteTemplate = useCallback(async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await templateService.deleteTemplate(id);
            await fetchTemplates(); // Refresh the list
            setFormMessage({ type: 'success', content: 'Template deleted successfully!' });
        } catch (err) {
            setError(`Failed to delete template: ${err.message}`);
            console.error('Delete template error:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchTemplates]);


    const handleCancelForm = useCallback(() => {
        setViewMode('list');
        setSelectedTemplate(null);
        setError(null);
        setFormMessage({ type: '', content: '' });
    }, []);

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>WhatsApp Templates</h4>
                {viewMode === 'list' && (
                    <button className="btn btn-success" onClick={handleCreateTemplate}>
                        <i className="bi bi-plus-lg me-2"></i>Create New Template
                    </button>
                )}
            </div>

            {error && <ErrorMessage message={error} />} {/* General error display */}
            {loading && <LoadingSpinner />} {/* General loading spinner */}

            {!loading && !error && viewMode === 'list' && (
                <TemplateList
                    templates={templates}
                    onViewDetail={handleViewDetail}
                    onEditTemplate={handleEditTemplate}
                    onDeleteTemplate={handleDeleteTemplate}
                />
            )}

            {!loading && !error && viewMode === 'detail' && selectedTemplate && (
                <TemplateDetail
                    template={selectedTemplate}
                    onBackToList={handleCancelForm}
                    onEditTemplate={handleEditTemplate}
                />
            )}

            {!loading && (viewMode === 'create' || viewMode === 'edit') && (
                <TemplateForm
                    template={selectedTemplate || {}} // Pass empty object for create
                    mode={viewMode}
                    onSubmit={handleSubmitTemplate}
                    onCancel={handleCancelForm}
                    loading={loading} // Pass loading to form for internal form buttons
                    error={error} // Pass error to form for internal validation messages
                    message={formMessage} // Pass form specific messages
                />
            )}
        </div>
    );
};

export default TemplateManagement;