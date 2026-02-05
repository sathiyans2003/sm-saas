// src/pages/whatsapp/TemplatesPage.jsx
import React, { useEffect, useState } from 'react';
import { getTemplates, syncTemplates } from '../../api/whatsappApi';

const TemplatesPage = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [selectedWaba, setSelectedWaba] = useState('Default WABA');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showSendModal, setShowSendModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showPayloadModal, setShowPayloadModal] = useState(false);

    // Send Modal Data
    const [targetPhone, setTargetPhone] = useState('');
    const [sending, setSending] = useState(false);

    const loadTemplates = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await getTemplates(selectedWaba === 'Default WABA' ? '123' : '456');
            setTemplates(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedWaba]);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await syncTemplates({ wabaId: selectedWaba });
            await loadTemplates();
            alert('Templates Synced Successfully!');
        } catch (err) {
            alert('Sync Failed');
        } finally {
            setSyncing(false);
        }
    };

    const handleCopyCode = (t) => {
        const code = `${t.name}#${t.language}`;
        navigator.clipboard.writeText(code);
        alert(`Copied: ${code}`);
    };

    const handleSendTest = async () => {
        if (!targetPhone) return alert('Enter phone number');
        setSending(true);
        try {
            // Mock API call
            await new Promise(r => setTimeout(r, 1000));
            alert(`Template sent to ${targetPhone}`);
            setShowSendModal(false);
            setTargetPhone('');
        } catch (err) {
            alert('Failed to send');
        } finally {
            setSending(false);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            APPROVED: 'success',
            REJECTED: 'danger',
            PENDING: 'warning'
        };
        return <span className={`badge bg-${colors[status] || 'secondary'}`}>{status}</span>;
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">WhatsApp Templates</h2>
                <div className="d-flex gap-2 align-items-center">
                    <select
                        className="form-select"
                        value={selectedWaba}
                        onChange={(e) => setSelectedWaba(e.target.value)}
                        style={{ width: '200px' }}
                    >
                        <option value="Default WABA">Tamil Business Tribe</option>
                        <option value="Zero Rupee - Zacx">Zero Rupee Marketer - Zacx</option>
                    </select>

                    <button
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={handleSync}
                        disabled={syncing}
                    >
                        {syncing ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-arrow-repeat"></i>}
                        Sync with Meta
                    </button>

                    <button
                        className="btn btn-success d-flex align-items-center gap-2"
                        onClick={() => window.location.href = '/whatsapp/templates/create'}
                    >
                        <i className="bi bi-plus-lg"></i> Create New
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card mb-3 border-0 shadow-sm">
                <div className="card-body p-2">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-0"><i className="bi bi-search"></i></span>
                        <input
                            type="text"
                            className="form-control border-0 shadow-none"
                            placeholder="Search templates by name (e.g. hello_world)..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">Name</th>
                                <th>Category</th>
                                <th>Language</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center p-4">Loading...</td></tr>
                            ) : filteredTemplates.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-4 text-muted">
                                        No templates found. {searchTerm ? 'Try a different search.' : 'Click "Sync with Meta" to fetch.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredTemplates.map((t) => (
                                    <tr key={t.metaId || t._id}>
                                        <td className="ps-4 fw-medium font-monospace text-primary">{t.name}</td>
                                        <td><span className="badge bg-light text-dark border">{t.category}</span></td>
                                        <td className="text-uppercase">{t.language}</td>
                                        <td>{getStatusBadge(t.status)}</td>
                                        <td className="text-end pe-4">
                                            <div className="btn-group">
                                                <button className="btn btn-sm btn-outline-secondary" title="Copy Code" onClick={() => handleCopyCode(t)}>
                                                    <i className="bi bi-clipboard"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-success" title="Send Template" onClick={() => { setSelectedTemplate(t); setTargetPhone(''); setShowSendModal(true); }}>
                                                    <i className="bi bi-send"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-primary" title="View Template" onClick={() => { setSelectedTemplate(t); setShowViewModal(true); }}>
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-dark" title="API Payload" onClick={() => { setSelectedTemplate(t); setShowPayloadModal(true); }}>
                                                    <i className="bi bi-code-slash"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-secondary" title="Edit" disabled>
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALS */}

            {/* SEND MODAL */}
            {showSendModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Send Test Message</h5>
                                <button className="btn-close" onClick={() => setShowSendModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Sending <strong>{selectedTemplate?.name}</strong></p>
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="+91 98765 43210"
                                    value={targetPhone}
                                    onChange={e => setTargetPhone(e.target.value)}
                                />
                                <div className="mt-3 bg-light p-2 rounded small text-muted">
                                    Preview: {selectedTemplate?.components?.find(c => c.type === 'BODY')?.text}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowSendModal(false)}>Close</button>
                                <button className="btn btn-success" onClick={handleSendTest} disabled={sending}>
                                    {sending ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW MODAL */}
            {showViewModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ maxWidth: '350px', margin: 'auto' }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title">Template Preview</h5>
                                <button className="btn-close" onClick={() => setShowViewModal(false)}></button>
                            </div>
                            <div className="modal-body p-0">
                                <div className="p-3 bg-image" style={{ backgroundImage: 'url(https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png)' }}>
                                    <div className="bg-white rounded p-2 shadow-sm my-2 position-relative">
                                        {/* Header */}
                                        {selectedTemplate?.components?.find(c => c.type === 'HEADER') && (
                                            <div className="fw-bold mb-2">
                                                {selectedTemplate.components.find(c => c.type === 'HEADER').format === 'TEXT' ? selectedTemplate.components.find(c => c.type === 'HEADER').text : `[${selectedTemplate.components.find(c => c.type === 'HEADER').format}]`}
                                            </div>
                                        )}
                                        {/* Body */}
                                        <div className="text-dark small" style={{ whiteSpace: 'pre-wrap' }}>
                                            {selectedTemplate?.components?.find(c => c.type === 'BODY')?.text}
                                        </div>
                                        {/* Footer */}
                                        {selectedTemplate?.components?.find(c => c.type === 'FOOTER') && (
                                            <div className="text-muted smaller mt-1" style={{ fontSize: '0.7em' }}>
                                                {selectedTemplate.components.find(c => c.type === 'FOOTER').text}
                                            </div>
                                        )}
                                        <div className="text-end text-muted" style={{ fontSize: '0.6em' }}>10:15 AM</div>
                                    </div>

                                    {/* Buttons */}
                                    {selectedTemplate?.components?.find(c => c.type === 'BUTTONS')?.buttons?.map((btn, i) => (
                                        <div key={i} className="bg-white text-primary text-center py-2 rounded shadow-sm mb-1 fw-bold small">
                                            {btn.text}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3">
                                    <div className="d-flex justify-content-between small text-muted">
                                        <span>Category: {selectedTemplate?.category}</span>
                                        <span>Lang: {selectedTemplate?.language}</span>
                                    </div>
                                    <div className="mt-2 text-center text-muted small">
                                        Last Updated: {new Date(selectedTemplate?.lastSyncedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PAYLOAD MODAL */}
            {showPayloadModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">API Payload</h5>
                                <button className="btn-close" onClick={() => setShowPayloadModal(false)}></button>
                            </div>
                            <div className="modal-body bg-light">
                                <pre className="m-0 p-2 border rounded bg-white text-dark small">
                                    {JSON.stringify({
                                        "messaging_product": "whatsapp",
                                        "to": "{{recipient_phone_number}}",
                                        "type": "template",
                                        "template": {
                                            "name": selectedTemplate?.name,
                                            "language": {
                                                "code": selectedTemplate?.language
                                            },
                                            "components": [
                                                {
                                                    "type": "body",
                                                    "parameters": [
                                                        {
                                                            "type": "text",
                                                            "text": "text_string"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    }, null, 2)}
                                </pre>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-outline-primary" onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify({
                                        "messaging_product": "whatsapp",
                                        "to": "{{recipient_phone_number}}",
                                        "type": "template",
                                        "template": { "name": selectedTemplate?.name, "language": { "code": selectedTemplate?.language } }
                                    }, null, 2));
                                    alert('Copied to clipboard');
                                }}>
                                    <i className="bi bi-clipboard"></i> Copy JSON
                                </button>
                                <button className="btn btn-secondary" onClick={() => setShowPayloadModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TemplatesPage;
