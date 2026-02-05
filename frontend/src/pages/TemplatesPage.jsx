// src/pages/TemplatesPage.jsx
import React from 'react';
import TemplateManagement from '../components/templates/TemplateManagement'; // Adjust path if needed

const TemplatesPage = () => {
    return (
        <div className="container-fluid mt-4">
            <h3>Templates Overview</h3>
            <TemplateManagement />
        </div>
    );
};

export default TemplatesPage;