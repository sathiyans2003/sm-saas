import React, { useState, useEffect } from 'react';
import { updateRole, createRole } from '../../api/rolesApi';

const PERMISSION_GROUPS = {
    'Modules': [
        { key: 'access_dashboard', label: 'Access Dashboard Module' },
        { key: 'access_chats', label: 'Access Chats Module' },
        { key: 'access_contacts', label: 'Access Contacts Module' },
        { key: 'access_broadcasts', label: 'Access Broadcasts Module' },
        { key: 'access_templates', label: 'Access Templates Module' },
        { key: 'access_phone_numbers', label: 'Access Phone Numbers Module' },
        { key: 'access_finance', label: 'Access Finance Module' },
        { key: 'access_settings', label: 'Access Settings Module' },
        { key: 'access_profile', label: 'Access Profile Module' }
    ],
    'Chats': [
        { key: 'view_all_chats', label: 'View All Chats' },
        { key: 'view_assigned_chats', label: 'View Assigned Chats' },
        { key: 'reply_to_chats', label: 'Reply to Chats' }
    ],
    'Contacts': [
        { key: 'create_contacts', label: 'Create Contacts' },
        { key: 'edit_contacts', label: 'Edit Contacts' },
        { key: 'delete_contacts', label: 'Delete Contacts' },
        { key: 'import_contacts', label: 'Import Contacts' },
        { key: 'export_contacts', label: 'Export Contacts' },
        { key: 'view_all_contacts', label: 'View All Contacts' },
        { key: 'view_assigned_contacts', label: 'View Assigned Contacts' }
    ],
    'Broadcasts': [
        { key: 'view_broadcasts', label: 'View Broadcasts' },
        { key: 'create_broadcasts', label: 'Create Broadcasts' }
    ],
    'Templates': [
        { key: 'view_templates', label: 'View Templates' },
        { key: 'create_templates', label: 'Create Templates' },
        { key: 'edit_templates', label: 'Edit Templates' },
        { key: 'delete_templates', label: 'Delete Templates' }
    ],
    'Phone Numbers': [
        { key: 'view_phone_numbers', label: 'View Phone Numbers' },
        { key: 'add_phone_numbers', label: 'Add Phone Numbers' },
        { key: 'edit_phone_numbers', label: 'Edit Phone Numbers' }
    ],
    'Team & Roles': [
        { key: 'view_team', label: 'View Team Members' },
        { key: 'invite_team', label: 'Invite Team Members' },
        { key: 'edit_team', label: 'Edit Team Members' },
        { key: 'deactivate_team', label: 'Deactivate Team Members' },
        { key: 'create_roles', label: 'Create Roles' },
        { key: 'edit_roles', label: 'Deactivate Roles' } // Match screenshot label
    ],
    'Workspace': [
        { key: 'view_workspace', label: 'View Workspace Details' },
        { key: 'edit_workspace', label: 'Edit Workspace Details' }
    ]
};

const RoleEditor = ({ role, onClose, onSave }) => {
    const [name, setName] = useState(role ? role.name : '');
    const [permissions, setPermissions] = useState(role ? role.permissions : {});

    const handleToggle = (key) => {
        setPermissions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleToggleGroup = (groupName, isChecked) => {
        const newPerms = { ...permissions };
        PERMISSION_GROUPS[groupName].forEach(p => {
            newPerms[p.key] = isChecked;
        });
        setPermissions(newPerms);
    };

    const handleSelectAllGlobal = (isChecked) => {
        const newPerms = { ...permissions };
        Object.values(PERMISSION_GROUPS).flat().forEach(p => {
            newPerms[p.key] = isChecked;
        });
        setPermissions(newPerms);
    };

    const isGlobalAllChecked = Object.values(PERMISSION_GROUPS).flat().every(p => permissions[p.key]);

    const handleSave = async () => {
        try {
            const data = { name, permissions };
            if (role) {
                await updateRole(role._id, data);
            } else {
                await createRole(data);
            }
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.msg || 'Failed to save role';
            alert(msg);
        }
    };

    return (
        <div className="offcanvas offcanvas-end show" tabIndex="-1" style={{ width: 600, visibility: 'visible' }}>
            <div className="offcanvas-header border-bottom">
                <h5 className="offcanvas-title fw-bold">{role ? 'Edit Role' : 'New Role'}</h5>
                <button type="button" className="btn-close text-reset" onClick={onClose}></button>
            </div>
            <div className="offcanvas-body bg-light">

                <div className="mb-4">
                    <label className="form-label fw-bold">Role Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Marketer"
                    />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">Permissions</h6>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="selectAllGlobal"
                            checked={isGlobalAllChecked}
                            onChange={(e) => handleSelectAllGlobal(e.target.checked)}
                        />
                        <label className="form-check-label small fw-bold" htmlFor="selectAllGlobal">
                            Select All Permissions
                        </label>
                    </div>
                </div>

                {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => {
                    const isGroupChecked = perms.every(p => permissions[p.key]);
                    return (
                        <div key={group} className="card shadow-sm mb-3">
                            <div className="card-header bg-white py-2 d-flex align-items-center gap-2">
                                <input
                                    className="form-check-input mt-0"
                                    type="checkbox"
                                    checked={isGroupChecked}
                                    onChange={(e) => handleToggleGroup(group, e.target.checked)}
                                />
                                <small className="fw-bold text-uppercase text-muted" style={{ cursor: 'pointer' }} onClick={() => handleToggleGroup(group, !isGroupChecked)}>{group}</small>
                            </div>
                            <div className="card-body">
                                <div className="row g-2">
                                    {perms.map(p => (
                                        <div className="col-md-6" key={p.key}>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={p.key}
                                                    checked={!!permissions[p.key]}
                                                    onChange={() => handleToggle(p.key)}
                                                />
                                                <label className="form-check-label small" htmlFor={p.key}>
                                                    {p.label}
                                                    {/* Add subtext if needed */}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="offcanvas-header border-top bg-white">
                <button className="btn btn-outline-secondary me-2" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}>Save Role</button>
            </div>
        </div>
    );
};

export default RoleEditor;
