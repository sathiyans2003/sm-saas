// src/components/common/ErrorMessage.jsx
import React from 'react';

const ErrorMessage = ({ message }) => {
    return (
        <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error!</h4>
            <p>{message}</p>
            <hr />
            <p className="mb-0">Please try again or contact support if the issue persists.</p>
        </div>
    );
};

export default ErrorMessage;