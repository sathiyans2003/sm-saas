import React from 'react';
import { useNavigate } from 'react-router-dom';

const WhatsAppFeaturesPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            title: 'Templates',
            description: 'Create and manage WhatsApp templates.',
            icon: 'bi-file-text',
            route: '/whatsapp/templates',
            color: 'primary'
        },
        {
            title: 'Manage Phone Numbers',
            description: 'View connected numbers, limits, and quality.',
            icon: 'bi-whatsapp',
            route: '/whatsapp/phone-numbers',
            color: 'success'
        },
        {
            title: 'WhatsApp Profile',
            description: 'Edit your business profile, photo, and details.',
            icon: 'bi-person-badge',
            route: '/whatsapp/profile',
            color: 'info'
        }
    ];

    return (
        <div className="container-fluid py-4">
            <h2 className="mb-4 fw-bold">WhatsApp Features</h2>
            <div className="row g-4">
                {features.map((feature, index) => (
                    <div className="col-md-4" key={index}>
                        <div
                            className="card shadow-sm h-100 feature-card cursor-pointer"
                            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                            onClick={() => navigate(feature.route)}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div className="card-body text-center p-5">
                                <div className={`mb-4 d-inline-flex align-items-center justify-content-center bg-light text-${feature.color} rounded-circle`} style={{ width: '80px', height: '80px' }}>
                                    <i className={`bi ${feature.icon} fs-1`}></i>
                                </div>
                                <h4 className="fw-bold mb-2">{feature.title}</h4>
                                <p className="text-muted">{feature.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WhatsAppFeaturesPage;
