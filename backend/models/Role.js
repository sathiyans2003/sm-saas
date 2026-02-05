const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    isSystem: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'DEACTIVATED'],
        default: 'ACTIVE'
    },
    permissions: {
        // Module Access
        access_dashboard: { type: Boolean, default: false },
        access_chats: { type: Boolean, default: false },
        access_contacts: { type: Boolean, default: false },
        access_broadcasts: { type: Boolean, default: false },
        access_automations: { type: Boolean, default: false }, // Not in screenshot but likely needed
        access_templates: { type: Boolean, default: false },
        access_phone_numbers: { type: Boolean, default: false },
        access_finance: { type: Boolean, default: false },
        access_settings: { type: Boolean, default: false },
        access_profile: { type: Boolean, default: false },

        // Chats
        view_all_chats: { type: Boolean, default: false },
        view_assigned_chats: { type: Boolean, default: false },
        reply_to_chats: { type: Boolean, default: false },

        // Contacts
        view_all_contacts: { type: Boolean, default: false },
        view_assigned_contacts: { type: Boolean, default: false },
        create_contacts: { type: Boolean, default: false },
        edit_contacts: { type: Boolean, default: false },
        delete_contacts: { type: Boolean, default: false },
        import_contacts: { type: Boolean, default: false },
        export_contacts: { type: Boolean, default: false },

        // Broadcasts
        view_broadcasts: { type: Boolean, default: false },
        create_broadcasts: { type: Boolean, default: false },

        // Templates
        view_templates: { type: Boolean, default: false },
        create_templates: { type: Boolean, default: false },
        edit_templates: { type: Boolean, default: false },
        delete_templates: { type: Boolean, default: false },

        // Phone Numbers
        view_phone_numbers: { type: Boolean, default: false },
        add_phone_numbers: { type: Boolean, default: false },
        edit_phone_numbers: { type: Boolean, default: false },

        // Team & Roles
        view_team: { type: Boolean, default: false },
        invite_team: { type: Boolean, default: false },
        edit_team: { type: Boolean, default: false },
        deactivate_team: { type: Boolean, default: false },

        create_roles: { type: Boolean, default: false },
        edit_roles: { type: Boolean, default: false }, // "Edit Roles" in screenshot? implies editing permissions
        deactivate_roles: { type: Boolean, default: false },

        // Workspace
        view_workspace: { type: Boolean, default: false },
        edit_workspace: { type: Boolean, default: false }
    }
}, { timestamps: true });

// Compound index to ensure role names are unique per workspace
RoleSchema.index({ workspace: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Role', RoleSchema);
