import React, { useState } from 'react';

const PlanBilling = ({ subscription }) => {
    const [subTab, setSubTab] = useState('plan'); // plan | billing | invoices
    const [billingPeriod, setBillingPeriod] = useState('quarterly'); // quarterly | yearly

    // Billing Form State
    const [billingData, setBillingData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        hasGst: '',
        gstin: '',
        companyName: '',
        country: '',
        state: '',
        zip: '',
        city: '',
        address1: '',
        address2: ''
    });

    const handleSaveBilling = () => {
        // API Call placeholder
        alert("Billing details saved!");
    };

    return (
        <div>
            {/* Header */}
            <h4 className="fw-bold mb-1">Plan & Billing</h4>
            <p className="text-muted small mb-4">Configure billing, download invoices, and manage your subscription here.</p>

            {/* Sub Tabs */}
            <div className="mb-4 text-nowrap" style={{ overflowX: 'auto' }}>
                <ul className="nav nav-pills border-bottom pb-2 gap-2" style={{ flexWrap: 'nowrap' }}>
                    <li className="nav-item">
                        <button
                            className={`nav-link btn-sm rounded-pill px-3 ${subTab === 'plan' ? 'active bg-dark' : 'text-muted'}`}
                            onClick={() => setSubTab('plan')}
                        >
                            Plan & Subscription
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link btn-sm rounded-pill px-3 ${subTab === 'billing' ? 'active bg-dark' : 'text-muted'}`}
                            onClick={() => setSubTab('billing')}
                        >
                            Billing Details
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link btn-sm rounded-pill px-3 ${subTab === 'invoices' ? 'active bg-dark' : 'text-muted'}`}
                            onClick={() => setSubTab('invoices')}
                        >
                            Invoices
                        </button>
                    </li>
                </ul>
            </div>

            {/* CONTENT: Plan & Subscription */}
            {subTab === 'plan' && (
                <div>
                    {/* Alert */}
                    <div className="alert alert-danger text-center border-danger bg-danger bg-opacity-10 mb-5">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Your subscription and grace period have ended. Please renew immediately to restore access.
                    </div>

                    <div className="text-center mb-5">
                        <h4 className="fw-bold mb-2">Choose your plan</h4>
                        <p className="text-muted">Select the perfect plan for your business needs.</p>

                        {/* Toggle */}
                        <div className="d-inline-flex bg-light rounded-pill p-1 border mt-3">
                            <button
                                className={`btn btn-sm rounded-pill px-4 ${billingPeriod === 'quarterly' ? 'bg-white shadow-sm fw-bold' : 'text-muted'}`}
                                onClick={() => setBillingPeriod('quarterly')}
                            >
                                Quarterly
                            </button>
                            <button
                                className={`btn btn-sm rounded-pill px-4 ${billingPeriod === 'yearly' ? 'bg-white shadow-sm fw-bold' : 'text-muted'}`}
                                onClick={() => setBillingPeriod('yearly')}
                            >
                                Yearly <span className="badge bg-success ms-1" style={{ fontSize: '0.6rem' }}>Save 20%</span>
                            </button>
                        </div>
                    </div>

                    {/* Pricing Card */}
                    <div className="d-flex justify-content-center">
                        <div className="card shadow border-success" style={{ width: '400px', borderTopWidth: '4px' }}>
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-1">Starter Plan</h5>
                                <p className="text-muted small mb-4">Everything you need to grow your business</p>

                                <h2 className="fw-bold mb-4">
                                    ₹{billingPeriod === 'quarterly' ? '3,000' : '10,000'}
                                    <span className="fs-6 text-muted fw-normal">/{billingPeriod === 'quarterly' ? 'quarter' : 'year'}</span>
                                </h2>

                                <ul className="list-unstyled mb-4 small text-muted">
                                    <li className="mb-2"><i className="bi bi-check-circle-fill text-muted me-2"></i> 1 Phone Number</li>
                                    <li className="mb-2"><i className="bi bi-check-circle-fill text-muted me-2"></i> Unlimited Chats</li>
                                    <li className="mb-2"><i className="bi bi-check-circle-fill text-muted me-2"></i> 100,000 Contacts</li>
                                    <li className="mb-2"><i className="bi bi-check-circle-fill text-muted me-2"></i> 10 Custom Fields/Columns</li>
                                    <li className="mb-2"><i className="bi bi-check-circle-fill text-muted me-2"></i> 10 Tags</li>
                                    <li className="mb-2"><i className="bi bi-check-circle-fill text-muted me-2"></i> 5 Segments</li>
                                    <li className="mb-2"><i className="bi bi-check-circle-fill text-muted me-2"></i> Unlimited Broadcasts</li>
                                    <li className="mb-2"><i className="bi bi-check-circle-fill text-muted me-2"></i> Unlimited Templates</li>
                                    <li className="mb-2"><i className="bi bi-check-circle-fill text-muted me-2"></i> 5 Team Members</li>
                                    <li className="mb-2"><i className="bi bi-check-circle-fill text-muted me-2"></i> Automations</li>
                                </ul>

                                <button className="btn btn-dark w-100 py-2">Subscribe Now</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENT: Billing Details */}
            {subTab === 'billing' && (
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        {/* Contact Info */}
                        <div className="card shadow-sm mb-4">
                            <div className="card-header bg-white py-3">
                                <h6 className="fw-bold mb-0">Billing Contact Information</h6>
                                <small className="text-muted">Invoices & Notifications will be sent to this address.</small>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">First Name <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" value={billingData.firstName} onChange={e => setBillingData({ ...billingData, firstName: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Last Name <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" value={billingData.lastName} onChange={e => setBillingData({ ...billingData, lastName: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Email <span className="text-danger">*</span></label>
                                        <input type="email" className="form-control" value={billingData.email} onChange={e => setBillingData({ ...billingData, email: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Phone (WhatsApp Number) <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white">🇮🇳</span>
                                            <input type="text" className="form-control" value={billingData.phone} onChange={e => setBillingData({ ...billingData, phone: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tax Info */}
                        <div className="card shadow-sm mb-4">
                            <div className="card-header bg-white py-3">
                                <h6 className="fw-bold mb-0">Tax Information</h6>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label small fw-bold d-block">Do you have GSTIN? <span className="text-danger">*</span></label>
                                    <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="radio" checked={billingData.hasGst === 'yes'} onChange={() => setBillingData({ ...billingData, hasGst: 'yes' })} />
                                        <label className="form-check-label small">Yes</label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="radio" checked={billingData.hasGst === 'no'} onChange={() => setBillingData({ ...billingData, hasGst: 'no' })} />
                                        <label className="form-check-label small">No</label>
                                    </div>
                                </div>
                                {billingData.hasGst === 'yes' && (
                                    <div>
                                        <label className="form-label small fw-bold">GSTIN <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <input type="text" className="form-control" value={billingData.gstin} onChange={e => setBillingData({ ...billingData, gstin: e.target.value })} />
                                            <span className="input-group-text bg-white text-success small border-start-0">
                                                <i className="bi bi-check-circle-fill me-1"></i> Verified
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Address Info */}
                        <div className="card shadow-sm mb-4">
                            <div className="card-header bg-white py-3">
                                <h6 className="fw-bold mb-0">Address Information</h6>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Company Name <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" value={billingData.companyName} onChange={e => setBillingData({ ...billingData, companyName: e.target.value })} />
                                </div>
                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Country <span className="text-danger">*</span></label>
                                        <select className="form-select" value={billingData.country} onChange={e => setBillingData({ ...billingData, country: e.target.value })}>
                                            <option>India</option>
                                            <option>USA</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">State <span className="text-danger">*</span></label>
                                        <select className="form-select" value={billingData.state} onChange={e => setBillingData({ ...billingData, state: e.target.value })}>
                                            <option>Tamil Nadu</option>
                                            <option>Kerala</option>
                                            <option>Karnataka</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Zipcode/Postal Code <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" value={billingData.zip} onChange={e => setBillingData({ ...billingData, zip: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">City <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" value={billingData.city} onChange={e => setBillingData({ ...billingData, city: e.target.value })} />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Address Line 1 <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" value={billingData.address1} onChange={e => setBillingData({ ...billingData, address1: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Address Line 2</label>
                                    <input type="text" className="form-control" value={billingData.address2} onChange={e => setBillingData({ ...billingData, address2: e.target.value })} placeholder="Enter address line 2" />
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end mb-5">
                            <button className="btn btn-dark px-4" onClick={handleSaveBilling}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENT: Invoices */}
            {subTab === 'invoices' && (
                <div className="card shadow-sm">
                    <div className="card-body text-center py-5">
                        <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
                            <i className="bi bi-receipt fs-1 text-muted"></i>
                        </div>
                        <h5>No invoices found</h5>
                        <p className="text-muted">You haven't generated any invoices yet.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanBilling;
