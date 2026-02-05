import React, { useState, useEffect } from 'react';
import { createBroadcast, getAudienceCount } from '../../api/broadcastsApi';
import { fetchTags } from '../../api/tagsApi';
import { fetchSegments, fetchImports } from '../../api/audienceApi';
import { getPhoneNumbers, getTemplates } from '../../api/whatsappApi';

const CreateBroadcastModal = ({ show, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        audienceType: 'TAG',
        audienceTags: [],
        selectedPhones: [],
        templateName: '',
        templateCategory: '',
        messageBody: 'Hello {{1}}, this is a test message.',
        sendType: 'NOW', // NOW or SCHEDULE
        scheduleDate: '',
        scheduleTime: ''
    });

    // Step 1 Data
    const [tags, setTags] = useState([]);
    const [segments, setSegments] = useState([]);
    const [imports, setImports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showTagDropdown, setShowTagDropdown] = useState(false);

    // Step 2 Data
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [loadingNumbers, setLoadingNumbers] = useState(false);

    // Step 3 Data
    const [templates, setTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [templateSearch, setTemplateSearch] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Step 4 Data
    const [walletBalance, setWalletBalance] = useState(710.611); // Mocked low balance to trigger error as per Screenshot
    const [costPerMsg, setCostPerMsg] = useState(0.99); // Mock cost

    const [targetCount, setTargetCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Load data on open
    useEffect(() => {
        if (show) {
            setStep(1); // Reset step
            setFormData(prev => ({
                ...prev,
                name: '',
                selectedPhones: [],
                templateName: '',
                sendType: 'NOW',
                scheduleDate: '',
                scheduleTime: ''
            }));
            fetchTags().then(res => setTags(res.data)).catch(console.error);
            fetchSegments().then(res => setSegments(res.data)).catch(console.error);
            fetchImports().then(res => setImports(res.data)).catch(console.error);
        }
    }, [show]);

    // Fetch Numbers when entering Step 2
    useEffect(() => {
        if (show && step === 2) {
            setLoadingNumbers(true);
            getPhoneNumbers()
                .then(res => {
                    setPhoneNumbers(res.data);
                })
                .catch(console.error)
                .finally(() => setLoadingNumbers(false));
        }
    }, [show, step]);

    // Fetch Templates when entering Step 3
    useEffect(() => {
        if (show && step === 3) {
            setLoadingTemplates(true);
            getTemplates()
                .then(res => {
                    setTemplates(res.data);
                })
                .catch(console.error)
                .finally(() => setLoadingTemplates(false));
        }
    }, [show, step]);


    const updateCount = async (type, selectedIds) => {
        try {
            const res = await getAudienceCount({ audienceType: type, tags: selectedIds });
            setTargetCount(res.data.count);
        } catch (err) {
            console.error(err);
        }
    };

    const handleTypeChange = (type) => {
        setFormData(prev => ({ ...prev, audienceType: type, audienceTags: [] }));
        setTargetCount(0);
        if (type === 'ALL') {
            updateCount('ALL', []);
        }
    };

    const handleTagToggle = (tagId) => {
        setFormData(prev => {
            const newTags = prev.audienceTags.includes(tagId)
                ? prev.audienceTags.filter(t => t !== tagId)
                : [...prev.audienceTags, tagId];
            updateCount('TAG', newTags);
            return { ...prev, audienceTags: newTags };
        });
    };

    const handleSingleSelect = (id, type) => {
        setFormData(prev => {
            const newSelection = [id];
            updateCount(type, newSelection);
            return { ...prev, audienceTags: newSelection };
        });
    };

    const handleNumberToggle = (numberId) => {
        setFormData(prev => {
            const current = prev.selectedPhones || [];
            const newSelection = current.includes(numberId)
                ? current.filter(id => id !== numberId)
                : [...current, numberId];
            return { ...prev, selectedPhones: newSelection };
        });
    }

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setFormData(prev => ({
            ...prev,
            templateName: template.name,
            templateCategory: template.category,
            messageBody: template.components?.find(c => c.type === 'BODY')?.text || ''
        }));
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.name) return alert('Please enter a broadcast name');
            if (targetCount === 0) return alert('Please select an audience');
            setStep(2);
        } else if (step === 2) {
            if ((formData.selectedPhones || []).length === 0) return alert('Please select at least one sender number');
            setStep(3);
        } else if (step === 3) {
            if (!formData.templateName) return alert('Please select a template');
            setStep(4);
        } else if (step === 4) {
            if (formData.sendType === 'SCHEDULE') {
                if (!formData.scheduleDate || !formData.scheduleTime) return alert('Please select date and time for scheduling');
            }
            handleSubmit();
        }
    };

    const handleBack = () => {
        setStep(prev => Math.max(1, prev - 1));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await createBroadcast(formData);
            onSuccess();
            onClose();
        } catch (err) {
            alert('Failed to create broadcast');
        } finally {
            setLoading(false);
        }
    };

    // Helper to parse limit string
    const parseLimit = (limitStr) => {
        if (!limitStr) return 1000;
        const num = parseInt(limitStr.replace(/[^0-9]/g, ''));
        return isNaN(num) ? 1000 : num;
    };

    // Calculations
    const selectedPhonesDetails = phoneNumbers.filter(p => formData.selectedPhones.includes(p.id));
    const totalCapacity = selectedPhonesDetails.reduce((acc, curr) => acc + parseLimit(curr.messaging_limit), 0);
    const isCapacitySafe = totalCapacity >= targetCount;

    // Filter tags/templates
    const filteredTags = tags.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase()));

    // Estimated time/cost
    const estimatedTime = targetCount > 0 ? `${Math.ceil(targetCount / 100)} min ${Math.ceil((targetCount % 100) * 0.6)} sec` : '0 min 0 sec';
    const totalCost = targetCount * costPerMsg;
    const isBalanceInsufficient = totalCost > walletBalance;


    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl">
                <div className="modal-content" style={{ minHeight: '600px' }}>

                    {/* HEADER */}
                    <div className="modal-header border-bottom-0 pb-0">
                        <h5 className="modal-title fw-bold">Create Broadcast</h5>
                        {/* WIZARD STEPS */}
                        <div className="d-flex align-items-center ms-auto small">
                            <div className={`d-flex align-items-center me-3 ${step === 1 ? 'text-success fw-bold' : (step > 1 ? 'text-success' : 'text-muted')}`}>
                                <span className={`badge rounded-circle me-1 ${step >= 1 ? 'bg-success' : 'bg-light text-secondary border'}`}>{step > 1 ? <i className="bi bi-check text-white"></i> : '1'}</span> Audience
                            </div>
                            <div className="border-top me-3" style={{ width: '30px', borderColor: step >= 2 ? '#198754' : '#dee2e6' }}></div>

                            <div className={`d-flex align-items-center me-3 ${step === 2 ? 'text-success fw-bold' : (step > 2 ? 'text-success' : 'text-muted')}`}>
                                <span className={`badge rounded-circle me-1 ${step >= 2 ? 'bg-success' : 'bg-light text-secondary border'}`}>{step > 2 ? <i className="bi bi-check text-white"></i> : '2'}</span> Select Numbers
                            </div>
                            <div className="border-top me-3" style={{ width: '30px', borderColor: step >= 3 ? '#198754' : '#dee2e6' }}></div>

                            <div className={`d-flex align-items-center me-3 ${step === 3 ? 'text-success fw-bold' : (step > 3 ? 'text-success' : 'text-muted')}`}>
                                <span className={`badge rounded-circle me-1 ${step >= 3 ? 'bg-success' : 'bg-light text-secondary border'}`}>{step > 3 ? <i className="bi bi-check text-white"></i> : '3'}</span> Choose Template
                            </div>
                            <div className="border-top me-3" style={{ width: '30px', borderColor: step >= 4 ? '#198754' : '#dee2e6' }}></div>

                            <div className={`d-flex align-items-center ${step === 4 ? 'text-primary fw-bold' : 'text-muted'}`}>
                                <span className={`badge rounded-circle me-1 ${step === 4 ? 'bg-primary' : 'bg-light text-secondary border'}`}>4</span> Estimation & Launch
                            </div>
                        </div>
                    </div>

                    <div className="modal-body px-4 pt-3">
                        <hr className="mt-0 mb-4" />
                        {/* STEP 1: AUDIENCE */}
                        {step === 1 && (
                            <div className="row h-100">
                                <div className="col-12 mb-3">
                                    <label className="form-label fw-bold">Broadcast Name</label>
                                    <input
                                        type="text"
                                        className="form-control w-50"
                                        placeholder="e.g. Pongal Offer 2026"
                                        value={formData.name}
                                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                {/* LEFT COLUMN: SELECTION */}
                                <div className="col-md-8 border-end pe-4">
                                    <h6 className="fw-bold mb-3">Choose Your Audience</h6>

                                    {/* CARDS GRID */}
                                    <div className="row g-3 mb-4">
                                        {/* TAGS */}
                                        <div className="col-md-6">
                                            <div
                                                className={`card p-3 cursor-pointer ${formData.audienceType === 'TAG' ? 'border-primary bg-light' : ''}`}
                                                onClick={() => handleTypeChange('TAG')}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" checked={formData.audienceType === 'TAG'} readOnly />
                                                    <label className="form-check-label fw-bold">Contact Tags</label>
                                                </div>
                                                <small className="text-muted ps-4 d-block">Target contacts with specific tags</small>
                                            </div>
                                        </div>

                                        {/* SEGMENTS */}
                                        <div className="col-md-6">
                                            <div
                                                className={`card p-3 cursor-pointer ${formData.audienceType === 'SEGMENT' ? 'border-primary bg-light' : ''}`}
                                                onClick={() => handleTypeChange('SEGMENT')}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" checked={formData.audienceType === 'SEGMENT'} readOnly />
                                                    <label className="form-check-label fw-bold">Contact Segments</label>
                                                </div>
                                                <small className="text-muted ps-4 d-block">Target specific customer segments</small>
                                            </div>
                                        </div>

                                        {/* IMPORTS */}
                                        <div className="col-md-6">
                                            <div
                                                className={`card p-3 cursor-pointer ${formData.audienceType === 'IMPORT' ? 'border-primary bg-light' : ''}`}
                                                onClick={() => handleTypeChange('IMPORT')}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" checked={formData.audienceType === 'IMPORT'} readOnly />
                                                    <label className="form-check-label fw-bold">Contact Imports</label>
                                                </div>
                                                <small className="text-muted ps-4 d-block">Target contacts from specific imports</small>
                                            </div>
                                        </div>

                                        {/* ALL CONTACTS */}
                                        <div className="col-md-6">
                                            <div
                                                className={`card p-3 cursor-pointer ${formData.audienceType === 'ALL' ? 'border-primary bg-light' : ''}`}
                                                onClick={() => handleTypeChange('ALL')}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" checked={formData.audienceType === 'ALL'} readOnly />
                                                    <label className="form-check-label fw-bold">All Contacts</label>
                                                </div>
                                                <small className="text-muted ps-4 d-block">Target all contacts in your workspace</small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SELECTION AREA */}
                                    {formData.audienceType === 'TAG' && (
                                        <div className="position-relative">
                                            <h6 className="fw-bold mb-2">Select Tags</h6>
                                            <div
                                                className="form-control d-flex align-items-center justify-content-between cursor-pointer mb-2"
                                                onClick={() => setShowTagDropdown(!showTagDropdown)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <span className={formData.audienceTags.length === 0 ? 'text-muted' : ''}>
                                                    {formData.audienceTags.length > 0
                                                        ? `${formData.audienceTags.length} tags selected`
                                                        : "Choose tags..."}
                                                </span>
                                                <i className={`bi bi-chevron-${showTagDropdown ? 'up' : 'down'}`}></i>
                                            </div>

                                            {showTagDropdown && (
                                                <div className="card position-absolute w-100 shadow-sm p-2" style={{ zIndex: 1000, top: '100%' }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm mb-2"
                                                        placeholder="Search tags..."
                                                        value={searchTerm}
                                                        onChange={e => setSearchTerm(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                        {filteredTags.map(tag => (
                                                            <div
                                                                key={tag._id}
                                                                className="d-flex align-items-center p-2 border-bottom hover-bg-light"
                                                                onClick={() => handleTagToggle(tag._id)}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input me-3"
                                                                    checked={formData.audienceTags.includes(tag._id)}
                                                                    readOnly
                                                                />
                                                                <span
                                                                    className="badge rounded-circle p-1 me-2"
                                                                    style={{ backgroundColor: tag.color || '#ccc', width: '10px', height: '10px' }}
                                                                > </span>
                                                                <span>{tag.name}</span>
                                                            </div>
                                                        ))}
                                                        {filteredTags.length === 0 && <div className="text-muted text-center py-2">No tags found</div>}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Selected Tags Pills */}
                                            <div className="d-flex flex-wrap gap-2 mt-2">
                                                {tags.filter(t => formData.audienceTags.includes(t._id)).map(tag => (
                                                    <span key={tag._id} className="badge bg-light text-dark border d-flex align-items-center">
                                                        {tag.name}
                                                        <i
                                                            className="bi bi-x ms-2 cursor-pointer"
                                                            onClick={(e) => { e.stopPropagation(); handleTagToggle(tag._id); }}
                                                        ></i>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {formData.audienceType === 'SEGMENT' && (
                                        <div>
                                            <h6 className="fw-bold mb-2">Select Segment</h6>
                                            <select
                                                className="form-select"
                                                onChange={e => handleSingleSelect(e.target.value, 'SEGMENT')}
                                            >
                                                <option value="">Choose a segment...</option>
                                                {segments.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    {formData.audienceType === 'IMPORT' && (
                                        <div>
                                            <h6 className="fw-bold mb-2">Select Import List</h6>
                                            <select
                                                className="form-select"
                                                onChange={e => handleSingleSelect(e.target.value, 'IMPORT')}
                                            >
                                                <option value="">Choose an import...</option>
                                                {imports.map(i => <option key={i._id} value={i._id}>{i.filename} ({i.count})</option>)}
                                            </select>
                                        </div>
                                    )}

                                </div>

                                {/* RIGHT COLUMN: SUMMARY */}
                                <div className="col-md-4 ps-4">
                                    <h6 className="fw-bold mb-4">Audience Summary</h6>

                                    <div className="mb-4">
                                        <div className="text-muted small text-uppercase fw-bold mb-1">Total Contacts</div>
                                        <div className="fs-2 fw-bold text-success">{targetCount}</div>
                                    </div>

                                    <div className="border-top pt-4 mb-4">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="text-muted small">Estimated time to send</span>
                                            <span className="fw-bold text-primary">{estimatedTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: SELECT NUMBERS */}
                        {step === 2 && (
                            <div className="row h-100">
                                {/* LEFT: Number Selection */}
                                <div className="col-md-7 border-end pe-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="fw-bold m-0">Select Number(s)</h6>
                                        <span className="text-muted small">Total No. of Contacts Selected: {targetCount}</span>
                                    </div>

                                    {loadingNumbers ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                            <div className="mt-3 text-muted">Loading numbers...</div>
                                        </div>
                                    ) : (
                                        <div className="row g-3">
                                            {phoneNumbers.map(phone => (
                                                <div className="col-12" key={phone.id}>
                                                    <div
                                                        className={`card p-3 cursor-pointer ${formData.selectedPhones.includes(phone.id) ? 'border-primary bg-light' : ''}`}
                                                        onClick={() => handleNumberToggle(phone.id)}
                                                    >
                                                        <div className="d-flex align-items-start">
                                                            <div className="form-check mt-1 me-3">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    checked={formData.selectedPhones.includes(phone.id)}
                                                                    readOnly
                                                                />
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <h6 className="fw-bold mb-1">{phone.verified_name || 'WhatsApp Number'}</h6>
                                                                <div className="text-muted mb-2">{phone.display_phone_number}</div>

                                                                <div className="d-flex gap-3 text-small">
                                                                    <div>
                                                                        <span className="text-muted me-1">Quality:</span>
                                                                        <span className={`badge border ${phone.quality_rating === 'GREEN' ? 'text-success border-success bg-light' : 'text-warning border-warning bg-light'}`}>
                                                                            {phone.quality_rating}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-muted me-1">Limit:</span>
                                                                        <span className="badge text-primary border border-primary bg-light">
                                                                            {phone.messaging_limit || '1000/day'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT: Capacity Panel */}
                                <div className="col-md-5 ps-4">
                                    <div className="card bg-warning bg-opacity-10 border-warning border-opacity-25 p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold text-warning-emphasis mb-0">Capacity Limit</h6>
                                            <span className="fw-bold text-warning-emphasis">{totalCapacity.toLocaleString()} / {targetCount.toLocaleString()}</span>
                                        </div>

                                        <div className="d-flex justify-content-between text-small text-muted mb-1">
                                            <span>Channel Capacity</span>
                                            <span>Audience Size</span>
                                        </div>

                                        <div className="progress mb-3" style={{ height: '10px' }}>
                                            <div
                                                className={`progress-bar ${isCapacitySafe ? 'bg-success' : 'bg-warning'}`}
                                                role="progressbar"
                                                style={{ width: `${Math.min(100, (totalCapacity / targetCount) * 100)}%` }}
                                            ></div>
                                        </div>

                                        <div className="small mb-3">
                                            {isCapacitySafe ? (
                                                <div className="text-success">
                                                    <i className="bi bi-check-circle-fill me-2"></i>
                                                    <strong>Safe to proceed!</strong> Your selected numbers can handle the entire audience size.
                                                </div>
                                            ) : (
                                                <div className="text-warning-emphasis">
                                                    <strong>{totalCapacity.toLocaleString()} messages</strong> will be sent.
                                                    <span className="text-danger fw-bold ms-1">{(targetCount - totalCapacity).toLocaleString()} won't be sent</span>
                                                    <p className="mt-2 text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                                                        The audience size is {targetCount.toLocaleString()}, but your selected numbers can only send {totalCapacity.toLocaleString()} messages per day.
                                                        We'll attempt to deliver to all contacts and prioritize best-performing contacts.
                                                        Any undelivered messages due to limit can be retargeted later.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {isCapacitySafe && (
                                            <div className="mt-2 text-success small border-top pt-2 border-warning border-opacity-25">
                                                It's safe to proceed with your broadcast.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: CHOOSE TEMPLATE */}
                        {step === 3 && (
                            <div className="row h-100">
                                <div className="col-12">
                                    <div className="mb-4 w-50 mx-auto">
                                        <label className="form-label fw-bold">Choose a Template</label>
                                        <select
                                            className="form-select"
                                            value={formData.templateName}
                                            onChange={(e) => {
                                                const tpl = templates.find(t => t.name === e.target.value);
                                                if (tpl) handleTemplateSelect(tpl);
                                            }}
                                        >
                                            <option value="">Select a template...</option>
                                            {templates.map(tpl => (
                                                <option key={tpl.id} value={tpl.name}>{tpl.name} ({tpl.category})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* PREVIEW */}
                                    <div className="d-flex justify-content-center">
                                        {selectedTemplate ? (
                                            <div className="card shadow-sm border-0" style={{ width: '300px', borderRadius: '12px' }}>
                                                <div className="card-header bg-success text-white py-3 border-0" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                                                    <small className="opacity-75">Template Preview</small>
                                                </div>
                                                <div className="card-body bg-white text-dark p-3" style={{ minHeight: '200px', whiteSpace: 'pre-wrap' }}>
                                                    {/* Header Mock */}
                                                    {selectedTemplate.components?.find(c => c.type === 'HEADER')?.format === 'IMAGE' && (
                                                        <div className="bg-light w-100 rounded mb-3 d-flex align-items-center justify-content-center text-muted" style={{ height: '120px' }}>
                                                            <i className="bi bi-image fs-1"></i>
                                                        </div>
                                                    )}

                                                    {/* Body */}
                                                    <p className="mb-2">
                                                        {selectedTemplate.components?.find(c => c.type === 'BODY')?.text?.replace(/{{(\d+)}}/g, '[var]')}
                                                    </p>

                                                    {/* Footer */}
                                                    <div className="text-muted small mt-3">
                                                        {selectedTemplate.components?.find(c => c.type === 'FOOTER')?.text}
                                                    </div>
                                                </div>
                                                <div className="card-footer bg-white border-top-0 pb-3" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                                                    {(selectedTemplate.components?.find(c => c.type === 'BUTTONS')?.buttons || []).map((btn, i) => (
                                                        <button key={i} className="btn btn-light btn-sm w-100 mb-1 text-primary fw-bold" disabled>{btn.text}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-muted py-5 bg-light rounded w-100 outline-dashed">
                                                <i className="bi bi-file-text fs-1 d-block mb-2"></i>
                                                <h6 className="fw-bold mb-0">Template Preview</h6>
                                                <p className="small mb-0">Select a template to view preview</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: ESTIMATION & LAUNCH */}
                        {step === 4 && (
                            <div>
                                <h6 className="text-muted fw-bold mb-3">Broadcast Name & Send Type</h6>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <div className="card p-3 h-100">
                                            <label className="form-label text-muted small fw-bold">Broadcast Name</label>
                                            <input
                                                type="text"
                                                className="form-control mb-2"
                                                placeholder="Enter broadcast name"
                                                value={formData.name}
                                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                            <small className="text-muted d-block">Give your broadcast a name Eg: Black Friday Sale, etc.</small>
                                            {!formData.name && <small className="text-danger">Broadcast name is required.</small>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card p-3 h-100">
                                            <label className="form-label text-muted small fw-bold mb-3">Send Type</label>
                                            <div className="row g-2 mb-3">
                                                <div className="col-6">
                                                    <div
                                                        className={`border rounded p-2 d-flex align-items-center cursor-pointer ${formData.sendType === 'NOW' ? 'border-success bg-success-subtle' : ''}`}
                                                        onClick={() => setFormData(prev => ({ ...prev, sendType: 'NOW' }))}
                                                    >
                                                        <div className={`rounded-circle p-2 me-2 ${formData.sendType === 'NOW' ? 'bg-success text-white' : 'bg-light text-secondary'}`}>
                                                            <i className="bi bi-send-fill"></i>
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold small">Send Now</div>
                                                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Immediate delivery</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div
                                                        className={`border rounded p-2 d-flex align-items-center cursor-pointer ${formData.sendType === 'SCHEDULE' ? 'border-primary bg-primary-subtle' : ''}`}
                                                        onClick={() => setFormData(prev => ({ ...prev, sendType: 'SCHEDULE' }))}
                                                    >
                                                        <div className={`rounded-circle p-2 me-2 ${formData.sendType === 'SCHEDULE' ? 'bg-primary text-white' : 'bg-light text-secondary'}`}>
                                                            <i className="bi bi-calendar-event"></i>
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold small">Schedule</div>
                                                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>Send later</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* SCHEDULE INPUTS */}
                                            {formData.sendType === 'SCHEDULE' && (
                                                <div className="mt-3 border-top pt-3">
                                                    <div className="row g-2 mb-2">
                                                        <div className="col-md-6">
                                                            <label className="form-label text-muted small fw-bold">Select Date</label>
                                                            <input
                                                                type="date"
                                                                className="form-control form-control-sm"
                                                                value={formData.scheduleDate}
                                                                min={new Date().toISOString().split('T')[0]}
                                                                onChange={e => setFormData(prev => ({ ...prev, scheduleDate: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label text-muted small fw-bold">Select Time</label>
                                                            <input
                                                                type="time"
                                                                className="form-control form-control-sm"
                                                                value={formData.scheduleTime}
                                                                onChange={e => setFormData(prev => ({ ...prev, scheduleTime: e.target.value }))}
                                                            />
                                                        </div>
                                                    </div>
                                                    {formData.scheduleDate && formData.scheduleTime && (
                                                        <div className="alert alert-light border small text-muted mb-0">
                                                            Broadcast will be scheduled for <br />
                                                            <strong className="text-dark">{formData.scheduleDate} {formData.scheduleTime} (Asia/Kolkata)</strong>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <h6 className="text-muted fw-bold mb-3">Broadcast Summary</h6>
                                <div className="row g-3">
                                    {/* Audience Summary */}
                                    <div className="col-md-3">
                                        <div className="card p-3 h-100">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="badge bg-primary rounded-circle p-2"><i className="bi bi-people-fill fs-6"></i></div>
                                                    <div>
                                                        <div className="fw-bold small">Audience</div>
                                                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Who will receive</div>
                                                    </div>
                                                </div>
                                                <span className="badge bg-light text-secondary border">{formData.audienceType === 'ALL' ? 'All Contacts' : 'Selection'}</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-end mt-auto">
                                                <span className="text-muted small">Total Contacts</span>
                                                <span className="fw-bold fs-5">{targetCount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* From Numbers */}
                                    <div className="col-md-3">
                                        <div className="card p-3 h-100">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="badge bg-primary rounded-circle p-2"><i className="bi bi-telephone-fill fs-6"></i></div>
                                                    <div>
                                                        <div className="fw-bold small">From Numbers</div>
                                                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Sending channels</div>
                                                    </div>
                                                </div>
                                                <span className="badge bg-light text-secondary border">{formData.selectedPhones.length} selected</span>
                                            </div>
                                            <div className="mt-auto">
                                                {selectedPhonesDetails.slice(0, 1).map(p => (
                                                    <div key={p.id} className="d-flex justify-content-between align-items-center small mb-1">
                                                        <div className="text-truncate" style={{ maxWidth: '120px' }}>
                                                            <div className="fw-bold">{p.verified_name}</div>
                                                            <div className="text-muted">{p.display_phone_number}</div>
                                                        </div>
                                                        <span className="text-muted">100% allocated</span>
                                                    </div>
                                                ))}
                                                {selectedPhonesDetails.length > 1 && <div className="text-muted small text-end">+{selectedPhonesDetails.length - 1} more</div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Template Details */}
                                    <div className="col-md-3">
                                        <div className="card p-3 h-100">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="badge bg-success rounded-circle p-2"><i className="bi bi-whatsapp fs-6 text-white"></i></div>
                                                    <div>
                                                        <div className="fw-bold small">Template Details</div>
                                                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Message content</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-auto">
                                                <div className="fw-bold text-truncate mb-1">{formData.templateName}</div>
                                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle">{formData.templateCategory}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Estimation */}
                                    <div className="col-md-3">
                                        <div className="card p-3 h-100 border-danger bg-danger bg-opacity-10">
                                            <div className="d-flex align-items-center gap-2 mb-3">
                                                <div className="badge bg-warning text-dark rounded-circle p-2"><i className="bi bi-calculator fs-6"></i></div>
                                                <div>
                                                    <div className="fw-bold small">Estimation</div>
                                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>Cost estimate</div>
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-between text-small mb-2 border-bottom pb-2 border-danger border-opacity-25">
                                                <span className="text-muted">Estimated Cost</span>
                                                <span className="fw-bold">₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 3 })}</span>
                                            </div>
                                            <div className="d-flex justify-content-between text-small mb-2">
                                                <span className="text-muted">Estimated time</span>
                                                <span className="fw-bold">{estimatedTime}</span>
                                            </div>
                                            <div className="d-flex justify-content-between text-small mb-3">
                                                <span className="text-muted">Wallet Balance</span>
                                                <span className="fw-bold text-danger">₹{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 3 })}</span>
                                            </div>

                                            {isBalanceInsufficient ? (
                                                <div className="alert alert-danger p-2 m-0 small border-0">
                                                    <div className="fw-bold"><i className="bi bi-circle-fill text-danger me-2" style={{ fontSize: '8px' }}></i>Insufficient Balance</div>
                                                    <div>You need ₹{(totalCost - walletBalance).toLocaleString(undefined, { minimumFractionDigits: 3 })} more to send.</div>
                                                </div>
                                            ) : (
                                                <div className="alert alert-success p-2 m-0 small border-0 text-center">
                                                    Sufficient Balance
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="modal-footer border-top-0 px-4 pb-4">
                        {step === 4 && isBalanceInsufficient ? (
                            <div className="w-100 d-flex justify-content-between align-items-center">
                                <button className="btn btn-outline-secondary" onClick={handleBack}>
                                    &lt; Back: Choose Template
                                </button>
                                <button className="btn btn-danger-subtle text-danger w-100 ms-3 border-danger fw-bold" disabled>
                                    Insufficient Balance, Please Recharge Wallet to Continue &gt;
                                </button>
                            </div>
                        ) : (
                            <>
                                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                                    <i className="bi bi-trash me-2"></i> Discard
                                </button>

                                <div className="ms-auto d-flex gap-2">
                                    {/* Dynamic Back Button Text based on Step */}
                                    {step > 1 && (
                                        <button className="btn btn-outline-secondary" onClick={handleBack}>
                                            &lt; Back: {step === 2 ? 'Audience' : (step === 3 ? 'Select Numbers' : 'Template')}
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className="btn btn-success px-4"
                                        onClick={handleNext}
                                        disabled={loading || (step === 1 && targetCount === 0) || (step === 4 && isBalanceInsufficient)}
                                    >
                                        {step === 4 ? 'Launch Broadcast' : (step === 3 ? 'Next: Estimation & Launch >' : (step === 2 ? 'Next: Choose Template >' : 'Next: Select Numbers >'))}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateBroadcastModal;
