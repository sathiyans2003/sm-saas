import React, { createContext, useState, useEffect, useContext } from 'react';
import { getSettings, getWorkspaces } from '../api/settingsApi';
import axios from 'axios';

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
    const [workspace, setWorkspace] = useState(null); // Active Workspace Details
    const [workspaces, setWorkspaces] = useState([]); // List of all workspaces
    const [loading, setLoading] = useState(true);

    const loadWorkspaces = async () => {
        try {
            // 1. Fetch List
            const listRes = await getWorkspaces();
            const list = listRes.data;
            setWorkspaces(list);

            if (list.length > 0) {
                // Determine active ID: ID from LocalStorage OR First one
                let activeId = localStorage.getItem('activeWorkspaceId');

                // Validate if stored ID still exists in list
                const exists = list.find(w => w._id === activeId);
                if (!activeId || !exists) {
                    activeId = list[0]._id;
                    localStorage.setItem('activeWorkspaceId', activeId);
                }

                // Set Header for all future requests
                axios.defaults.headers.common['x-workspace-id'] = activeId;

                // 2. Fetch Details for Active
                // We call getSettings() which now respects the header
                await refreshWorkspace();
            } else {
                setWorkspaces([]);
            }
        } catch (err) {
            console.error("Failed to load workspaces", err);
        } finally {
            setLoading(false);
        }
    };

    const refreshWorkspace = async () => {
        try {
            const res = await getSettings();
            if (res.data) {
                setWorkspace(res.data);
            }
        } catch (err) {
            console.error("Failed to refresh workspace info");
        }
    };

    const switchWorkspace = async (workspaceId) => {
        setLoading(true);
        try {
            localStorage.setItem('activeWorkspaceId', workspaceId);
            axios.defaults.headers.common['x-workspace-id'] = workspaceId;

            await refreshWorkspace();

            // Reload window to ensure all components (Navbar, pages) re-fetch data fresh
            // or we could just set state, but full reload is safer for MVP context consistency
            // For now, let's just update state to avoid full reload
            // window.location.reload(); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (localStorage.getItem('token')) {
            loadWorkspaces();
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <WorkspaceContext.Provider value={{
            workspace,
            workspaces,
            refreshWorkspace,
            fetchWorkspacesList: loadWorkspaces, // Expose for manual refresh
            switchWorkspace,
            loading
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => useContext(WorkspaceContext);
