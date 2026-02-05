import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTemplate } from '../../api/whatsappApi';
import EmojiPicker from 'emoji-picker-react';

const CreateTemplatePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [language, setLanguage] = useState('');

    // Components State
    const [headerType, setHeaderType] = useState('NONE'); // NONE, TEXT, IMAGE, VIDEO, DOCUMENT, LOCATION
    const [headerText, setHeaderText] = useState('');
    const [headerMedia, setHeaderMedia] = useState(null); // File object
    const [headerPreviewUrl, setHeaderPreviewUrl] = useState(null);

    const handleHeaderFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setHeaderMedia(file);
            setHeaderPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Helper to render header input
    const renderHeaderInput = () => {
        if (headerType === 'NONE') return null;
        if (headerType === 'TEXT') {
            return (
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter header text"
                    value={headerText}
                    onChange={e => setHeaderText(e.target.value)}
                    maxLength={60}
                />
            );
        }

        // Styled File Upload (Matches Screenshot)
        const getIconClass = () => {
            if (headerType === 'DOCUMENT') return 'bi-file-earmark-text text-success';
            if (headerType === 'IMAGE') return 'bi-image text-primary';
            return 'bi-play-circle text-danger';
        };

        const getFileTypes = () => {
            if (headerType === 'DOCUMENT') return 'PDF, DOC, DOCX, TXT (Max: 100MB)';
            if (headerType === 'IMAGE') return 'JPG, PNG (Max: 5MB)';
            return 'MP4 (Max: 16MB)';
        };

        return (
            <div className="border rounded-3 p-4 text-center" style={{ borderStyle: 'dashed', borderColor: '#dee2e6', backgroundColor: '#f8f9fa' }}>
                <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                    <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center p-2" style={{ width: '40px', height: '40px' }}>
                        <i className={`bi ${getIconClass()} fs-4`}></i>
                    </div>
                    <div>
                        <label className="btn btn-outline-secondary btn-sm fw-bold">
                            <i className="bi bi-upload me-2"></i> Choose {headerType.toLowerCase()}
                            <input
                                type="file"
                                className="d-none"
                                accept={headerType === 'IMAGE' ? 'image/*' : (headerType === 'VIDEO' ? 'video/*' : '.pdf,.doc,.docx,.txt')}
                                onChange={handleHeaderFileChange}
                            />
                        </label>
                    </div>
                </div>
                {headerMedia ? (
                    <div className="text-success small fw-bold">
                        <i className="bi bi-check-circle-fill me-1"></i> {headerMedia.name}
                    </div>
                ) : (
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {getFileTypes()}
                    </div>
                )}
            </div>
        );
    };

    // Helper to render preview header
    const renderPreviewHeader = () => {
        if (headerType === 'NONE') return null;
        if (headerType === 'TEXT') return headerText && <div className="fw-bold mb-2">{headerText}</div>;

        if (headerType === 'IMAGE') {
            return (
                <div className="bg-secondary bg-opacity-25 rounded w-100 d-flex align-items-center justify-content-center text-muted mb-2 overflow-hidden" style={{ height: '140px' }}>
                    {headerPreviewUrl ? (
                        <img src={headerPreviewUrl} alt="Header" className="w-100 h-100 object-fit-cover" />
                    ) : (
                        <i className="bi bi-image fs-1"></i>
                    )}
                </div>
            );
        }

        if (headerType === 'VIDEO') {
            return (
                <div className="bg-secondary bg-opacity-25 rounded w-100 d-flex align-items-center justify-content-center text-muted mb-2 overflow-hidden" style={{ height: '140px' }}>
                    {headerPreviewUrl ? (
                        <video src={headerPreviewUrl} className="w-100 h-100 object-fit-cover" controls />
                    ) : (
                        <i className="bi bi-play-circle fs-1"></i>
                    )}
                </div>
            );
        }

        if (headerType === 'DOCUMENT') {
            return (
                <div className="bg-white rounded p-3 mb-2 d-flex align-items-center justify-content-center shadow-sm" style={{ height: '100px', border: '1px solid #f0f0f0' }}>
                    <div className="bg-light rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-file-earmark-text text-success fs-3"></i>
                    </div>
                </div>
            );
        }

        return null;
    };

    const [bodyText, setBodyText] = useState('');
    const [footerText, setFooterText] = useState('');
    const [buttons, setButtons] = useState([]); // Array of button objects

    // Variable & Sample State
    const [sampleValues, setSampleValues] = useState({});

    // Emoji & Formatting State
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const textareaRef = React.useRef(null);

    const handleEmojiClick = (emojiData) => {
        const emoji = emojiData.emoji;
        insertAtCursor(emoji);
        setShowEmojiPicker(false);
    };

    const insertAtCursor = (textToInsert) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = bodyText;
        const newText = text.substring(0, start) + textToInsert + text.substring(end);

        setBodyText(newText);

        // Restore cursor + move it
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
            textarea.focus();
        }, 0);
    };

    const formatText = (format) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = bodyText;
        const selectedText = text.substring(start, end);

        let newText;
        let newCursorPos;

        if (format === 'bold') {
            newText = text.substring(0, start) + `*${selectedText || ''}*` + text.substring(end);
            newCursorPos = end + 2; // Move past closing *
        } else if (format === 'italic') {
            newText = text.substring(0, start) + `_${selectedText || ''}_` + text.substring(end);
            newCursorPos = end + 2;
        } else if (format === 'strike') {
            newText = text.substring(0, start) + `~${selectedText || ''}~` + text.substring(end);
            newCursorPos = end + 2;
        } else if (format === 'code') {
            newText = text.substring(0, start) + `\`\`\`${selectedText || ''}\`\`\`` + text.substring(end);
            newCursorPos = end + 6;
        }

        setBodyText(newText);

        // If selection was empty, place cursor inside the markers
        setTimeout(() => {
            if (selectedText.length === 0) {
                if (format === 'bold') textarea.selectionStart = textarea.selectionEnd = start + 1;
                else if (format === 'italic') textarea.selectionStart = textarea.selectionEnd = start + 1;
                else if (format === 'strike') textarea.selectionStart = textarea.selectionEnd = start + 1;
                else if (format === 'code') textarea.selectionStart = textarea.selectionEnd = start + 3;
            } else {
                textarea.selectionStart = textarea.selectionEnd = newCursorPos;
            }
            textarea.focus();
        }, 0);
    };

    // Parse variables from body text (e.g. {{1}}, {{2}})
    const getVariables = () => {
        const matches = bodyText.match(/\{\{\d+\}\}/g);
        if (!matches) return [];
        // Unique variables only, sorted
        return [...new Set(matches)].sort();
    };

    const variables = getVariables();

    const handleSampleValueChange = (variable, value) => {
        setSampleValues(prev => ({
            ...prev,
            [variable]: value
        }));
    };

    const handleInsertVariable = () => {
        const currentVars = getVariables();
        const nextNum = currentVars.length + 1;
        setBodyText(prev => prev + ` {{${nextNum}}} `);
    };

    // Handlers
    const handleAddButton = (type) => {
        if (buttons.length >= 10) return; // Meta max 10

        setButtons([...buttons, { type, text: '', urlType: 'STATIC', phoneNumber: '' }]);
    };

    const handleRemoveButton = (index) => {
        const newBtns = [...buttons];
        newBtns.splice(index, 1);
        setButtons(newBtns);
    };

    const handleButtonChange = (index, field, value) => {
        const newBtns = [...buttons];
        newBtns[index][field] = value;
        setButtons(newBtns);
    };

    const handleInsertButtonVariable = (index) => {
        const newBtns = [...buttons];
        newBtns[index].url = (newBtns[index].url || '') + '{{1}}';
        setButtons(newBtns);
    };

    const handleSubmit = async () => {
        if (!name || !category || !language || !bodyText) {
            alert('Please fill all required fields');
            return;
        }

        setLoading(true);
        const components = [];

        // Header
        if (headerType !== 'NONE') {
            components.push({
                type: 'HEADER',
                format: headerType === 'TEXT' ? 'TEXT' : headerType.toUpperCase(),
                text: headerType === 'TEXT' ? headerText : undefined
            });
        }

        // Body
        components.push({
            type: 'BODY',
            text: bodyText
        });

        // Footer
        if (footerText) {
            components.push({
                type: 'FOOTER',
                text: footerText
            });
        }

        // Buttons
        if (buttons.length > 0) {
            components.push({
                type: 'BUTTONS',
                buttons: buttons.map(b => ({
                    type: b.type === 'QUICK_REPLY' ? 'QUICK_REPLY' : 'URL', // Simplified
                    text: b.text
                }))
            });
        }

        const payload = {
            wabaId: 'default_waba_123', // TODO: Get from context/selector
            name,
            category,
            language,
            components
        };

        try {
            await createTemplate(payload);
            navigate('/whatsapp/templates');
        } catch (err) {
            console.error(err);
            alert('Failed to create template');
        } finally {
            setLoading(false);
        }
    };

    // Render Preview Logic Updated for Variables & Formatting
    const formatPreviewBody = (text) => {
        if (!text) return 'Start typing to preview...';

        // 1. Handle Variables First
        let formatted = text;
        variables.forEach(v => {
            const val = sampleValues[v] || v;
            formatted = formatted.split(v).join(val === v ? v : `[${val}]`);
        });

        // 2. Handle Formatting (Simple Regex Replacement to JSX)
        // We need to return an array of elements or a parent element, not a string if we use JSX.
        // Let's split by line breaks first to handle paragraphs
        const lines = formatted.split('\n');

        return lines.map((line, lineIdx) => {
            // Tokenize string by formatting markers
            // This is a naive implementation. For full WhatsApp md support, a parser library is better.
            // But for this requirement, we can chain replacements or usage regex split.

            // Strategy: Replace markers with HTML tags then allow React to render? 
            // Better: Use a small parser function.

            const parseFormatting = (str) => {
                const parts = str.split(/(\*.*?\*|~.*?~|`.*?`|_{1}.*?_{1})/g);
                return parts.map((part, i) => {
                    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
                        return <strong key={i}>{part.slice(1, -1)}</strong>;
                    }
                    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
                        return <em key={i}>{part.slice(1, -1)}</em>;
                    }
                    if (part.startsWith('~') && part.endsWith('~') && part.length > 2) {
                        return <del key={i}>{part.slice(1, -1)}</del>;
                    }
                    if (part.startsWith('```') && part.endsWith('```') && part.length > 6) {
                        return <code key={i} className="bg-light px-1 rounded">{part.slice(3, -3)}</code>;
                    }
                    return part;
                });
            };

            return (
                <div key={lineIdx} style={{ minHeight: '1.2em' }}>
                    {parseFormatting(line)}
                </div>
            );
        });
    };

    return (
        <div className="container-fluid h-100 bg-light p-0 d-flex flex-column" style={{ minHeight: '100vh' }}>
            {/* Header */}
            <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Create WhatsApp Template</h5>
                <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2">
                    <i className="bi bi-play-circle"></i> Video Tutorial
                </button>
            </div>

            <div className="row g-0 flex-grow-1">
                {/* LEFT: Editor Form */}
                <div className="col-lg-8 p-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 70px)' }}>
                    <div className="bg-white p-4 rounded shadow-sm mb-4">
                        {/* Top Inputs */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="enter_template_name (lowercase)"
                                    value={name}
                                    onChange={e => setName(e.target.value.toLowerCase().replace(/ /g, '_'))}
                                />
                            </div>
                            <div className="col-md-4">
                                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                                    <option value="">Select category</option>
                                    <option value="MARKETING">Marketing</option>
                                    <option value="UTILITY">Utility</option>
                                    <option value="AUTHENTICATION">Authentication</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <select className="form-select" value={language} onChange={e => setLanguage(e.target.value)}>
                                    <option value="">Choose language</option>
                                    <option value="en_US">English (US)</option>
                                    <option value="ta_IN">Tamil</option>
                                </select>
                            </div>
                        </div>

                        {/* Components */}

                        {/* Header */}
                        <div className="mb-4 text-start">
                            <label className="fw-bold mb-2 small text-muted">Header (Optional)</label>
                            <div className="d-flex gap-2 mb-3">
                                {['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION'].map(type => (
                                    <button
                                        key={type}
                                        className={`btn btn-sm rounded-pill px-3 ${headerType === type ? 'btn-dark' : 'btn-light border text-muted'}`}
                                        onClick={() => setHeaderType(type)}
                                    >
                                        {type.charAt(0) + type.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                            {renderHeaderInput()}
                        </div>

                        {/* Body */}
                        <div className="mb-4 position-relative text-start">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="fw-bold small text-muted">Message Content <span className="text-danger">*</span></label>
                                <div className="btn-group position-relative">
                                    <button className="btn btn-light btn-sm border" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                        <i className="bi bi-emoji-smile text-warning"></i>
                                    </button>

                                    {showEmojiPicker && (
                                        <div className="position-absolute" style={{ top: '40px', left: '0', zIndex: 1000 }}>
                                            <React.Suspense fallback={<div>Loading...</div>}>
                                                <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400} />
                                            </React.Suspense>
                                        </div>
                                    )}

                                    <button className="btn btn-light btn-sm border fw-bold" onClick={() => formatText('bold')}>B</button>
                                    <button className="btn btn-light btn-sm border fst-italic" onClick={() => formatText('italic')}>I</button>
                                    <button className="btn btn-light btn-sm border text-decoration-line-through" onClick={() => formatText('strike')}>S</button>
                                    <button className="btn btn-light btn-sm border" onClick={() => formatText('code')}><i className="bi bi-code"></i></button>
                                    <button className="btn btn-light btn-sm border" onClick={handleInsertVariable}>+ Insert Variable</button>
                                </div>
                            </div>
                            <textarea
                                ref={textareaRef}
                                className="form-control pb-4"
                                rows="6"
                                value={bodyText}
                                onChange={e => setBodyText(e.target.value)}
                                maxLength={1024}
                            ></textarea>
                            <div className="text-end text-muted small mt-1">{bodyText.length}/1024</div>
                        </div>

                        {/* Sample Values Section */}
                        {variables.length > 0 && (
                            <div className="mb-4 text-start">
                                <label className="fw-bold mb-2 small text-muted">Sample values for variables <span className="text-danger">*</span></label>
                                <div className="alert alert-success d-flex align-items-start p-2 mb-3" style={{ fontSize: '0.8rem' }}>
                                    <i className="bi bi-info-circle-fill me-2 mt-1"></i>
                                    <div>Fill in example values that represent what real data would look like. For example: names, dates, order numbers, etc. These help preview how your message will appear to recipients.</div>
                                </div>

                                <div className="border rounded p-3 bg-white">
                                    {variables.map(v => (
                                        <div key={v} className="mb-3">
                                            <label className="form-label small fw-bold mb-1">{v}</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder={`Enter Sample Content For ${v}`}
                                                value={sampleValues[v] || ''}
                                                onChange={e => handleSampleValueChange(v, e.target.value)}
                                                style={{ borderColor: !sampleValues[v] ? '#dc3545' : '' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mb-4 text-start">
                            <label className="fw-bold mb-2 small text-muted">Footer (Optional)</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter footer text"
                                value={footerText}
                                onChange={e => setFooterText(e.target.value)}
                                maxLength={60}
                            />
                            <div className="text-end text-muted small mt-1">{footerText.length}/60</div>
                        </div>

                        {/* Buttons */}
                        <div className="mb-3 text-start">
                            <label className="fw-bold mb-2 small text-muted">Buttons & CTAs</label>
                            <p className="small text-muted mb-3">Create buttons that let customers respond to your message or take action.</p>

                            {buttons.map((btn, idx) => (
                                <div key={idx} className="bg-light p-3 rounded mb-3 border">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="small fw-bold text-muted">
                                            {btn.type === 'QUICK_REPLY' && <><i className="bi bi-reply-fill me-1"></i> Quick Reply</>}
                                            {btn.type === 'CTA' && <><i className="bi bi-box-arrow-up-right me-1"></i> URL Button</>}
                                            {btn.type === 'PHONE_NUMBER' && <><i className="bi bi-telephone-fill me-1"></i> Phone Number Button</>}
                                        </div>
                                        <button className="btn btn-sm text-danger p-0" onClick={() => handleRemoveButton(idx)}><i className="bi bi-x-lg"></i></button>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">Button Text</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder={btn.type === 'QUICK_REPLY' ? 'Button text' : 'Button label'}
                                                value={btn.text}
                                                onChange={e => handleButtonChange(idx, 'text', e.target.value)}
                                                maxLength={25}
                                            />
                                        </div>

                                        {btn.type === 'CTA' && (
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Action Type</label>
                                                <select className="form-select form-select-sm" value={btn.urlType} onChange={e => handleButtonChange(idx, 'urlType', e.target.value)}>
                                                    <option value="STATIC">Static URL</option>
                                                    <option value="DYNAMIC">Dynamic URL</option>
                                                </select>
                                            </div>
                                        )}

                                        {btn.type === 'CTA' && (
                                            <div className="col-12">
                                                <label className="form-label small fw-bold text-muted">Website URL</label>
                                                <div className="input-group input-group-sm mb-2">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="https://www.example.com"
                                                        value={btn.url || ''}
                                                        onChange={e => handleButtonChange(idx, 'url', e.target.value)}
                                                    />
                                                    {btn.urlType === 'DYNAMIC' && (
                                                        <button className="btn btn-outline-secondary" type="button" onClick={() => handleInsertButtonVariable(idx)}>
                                                            {'{{1}}'}
                                                        </button>
                                                    )}
                                                </div>

                                                {btn.urlType === 'DYNAMIC' && (
                                                    <div className="bg-white p-3 border rounded">
                                                        <div className="row align-items-center mb-3">
                                                            <div className="col-auto">
                                                                <span className="badge bg-light text-dark border">{'{{1}}'}</span>
                                                            </div>
                                                            <div className="col">
                                                                <label className="small text-muted mb-1">Example for {'{{1}}'}</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    placeholder="Enter variable example"
                                                                    value={btn.sampleValue || ''}
                                                                    onChange={e => handleButtonChange(idx, 'sampleValue', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="mb-2">
                                                            <div className="row">
                                                                <div className="col-3 text-muted small fw-bold">Base URL</div>
                                                                <div className="col-9 small text-break text-muted">{btn.url || '-'}</div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="row">
                                                                <div className="col-3 text-muted small fw-bold">Sample URL</div>
                                                                <div className="col-9 small text-break text-dark">
                                                                    {btn.url ? btn.url.replace('{{1}}', btn.sampleValue || '') : '-'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {btn.type === 'PHONE_NUMBER' && (
                                            <div className="col-12">
                                                <label className="form-label small fw-bold text-muted">Phone Number</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="+91 98765 43210"
                                                    value={btn.phoneNumber || ''}
                                                    onChange={e => handleButtonChange(idx, 'phoneNumber', e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="dropdown">
                                <button className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                                    <i className="bi bi-plus-lg"></i> Add Button
                                </button>
                                <ul className="dropdown-menu p-0 shadow border-0 overflow-hidden" style={{ width: '300px' }}>
                                    <li>
                                        <button className="dropdown-item p-3 border-bottom d-flex gap-3 align-items-start" onClick={() => handleAddButton('QUICK_REPLY')}>
                                            <div className="bg-primary bg-opacity-10 text-primary rounded p-2"><i className="bi bi-reply-fill fs-5"></i></div>
                                            <div>
                                                <div className="fw-bold mb-1">Quick Reply</div>
                                                <div className="text-wrap small text-muted" style={{ fontSize: '0.75rem' }}>Quick Replies, used for contact engagement and chatbots.</div>
                                            </div>
                                        </button>
                                    </li>
                                    <li>
                                        <button className="dropdown-item p-3 border-bottom d-flex gap-3 align-items-start" onClick={() => handleAddButton('CTA')}>
                                            <div className="bg-success bg-opacity-10 text-success rounded p-2"><i className="bi bi-box-arrow-up-right fs-5"></i></div>
                                            <div>
                                                <div className="fw-bold mb-1">URL Button</div>
                                                <div className="text-wrap small text-muted" style={{ fontSize: '0.75rem' }}>2 buttons maximum, take contact to a link.</div>
                                            </div>
                                        </button>
                                    </li>
                                    <li>
                                        <button className="dropdown-item p-3 d-flex gap-3 align-items-start" onClick={() => handleAddButton('PHONE_NUMBER')}>
                                            <div className="bg-info bg-opacity-10 text-info rounded p-2"><i className="bi bi-telephone-fill fs-5"></i></div>
                                            <div>
                                                <div className="fw-bold mb-1">Phone Number Button</div>
                                                <div className="text-wrap small text-muted" style={{ fontSize: '0.75rem' }}>1 button maximum, contact will be able to call you.</div>
                                            </div>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Preview */}
                <div className="col-lg-4 bg-white border-start p-4 d-flex flex-column align-items-center justify-content-center bg-dots">
                    <h6 className="align-self-start mb-4 text-muted fw-bold">Preview</h6>

                    {/* Mobile Bezel */}
                    <div className="phone-preview bg-light border shadow-sm rounded-4 overflow-hidden position-relative" style={{ width: '320px', height: '600px', backgroundImage: 'url(https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png)', backgroundSize: 'cover' }}>
                        <div className="p-3 pt-5 mt-4">
                            <div className="bg-white rounded-3 shadow-sm p-2 position-relative" style={{ maxWidth: '85%' }}>
                                {/* Header */}
                                {renderPreviewHeader()}

                                {/* Body */}
                                <div className="mb-1 text-dark" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                                    {formatPreviewBody(bodyText)}
                                </div>

                                {/* Footer */}
                                {footerText && <div className="small text-muted mt-2" style={{ fontSize: '0.75rem' }}>{footerText}</div>}

                                {/* Timestamp */}
                                <div className="text-end text-muted small mt-1" style={{ fontSize: '0.65rem' }}>10:09 AM</div>

                                {/* Buttons (Inside Bubble) */}
                                {buttons.length > 0 && (
                                    <div className="mt-2 border-top">
                                        {buttons.map((btn, i) => (
                                            <div key={i} className="py-2 text-center border-bottom d-flex align-items-center justify-content-center text-primary fw-bold" style={{ fontSize: '0.9rem', cursor: 'pointer', borderBottomColor: '#e9ecef' }}>
                                                {btn.type === 'CTA' && <i className="bi bi-box-arrow-up-right me-2"></i>}
                                                {btn.type === 'PHONE_NUMBER' && <i className="bi bi-telephone me-2"></i>}
                                                {btn.type === 'QUICK_REPLY' && <i className="bi bi-reply me-2"></i>}
                                                {btn.text || 'Button'}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-white border-top px-4 py-3 d-flex justify-content-between">
                <button className="btn btn-outline-secondary" onClick={() => navigate('/whatsapp/templates')}><i className="bi bi-trash me-2"></i> Discard</button>
                <button className="btn btn-success px-4" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Creating...' : 'Create WhatsApp Template'}
                </button>
            </div>
        </div>
    );
};

export default CreateTemplatePage;
