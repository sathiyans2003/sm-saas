import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';

const RequireWorkspace = ({ children }) => {
    const { workspaces, workspace, loading } = useWorkspace();

    if (loading) {
        return <div className="text-center p-5">Loading Workspace...</div>;
    }

    if (!workspaces || workspaces.length === 0) {
        return <Navigate to="/create-workspace" replace />;
    }

    // Check WhatsApp Connection (New Requirement)
    // If active workspace exists but not connected, redirect to connection page
    if (workspace && !workspace.whatsappConnected) {
        return <Navigate to="/whatsapp/connect-number" replace />;
    }

    return children;
};

export default RequireWorkspace;
