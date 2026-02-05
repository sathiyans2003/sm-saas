const Role = require('../models/Role');

const checkPermission = (permission) => {
    return async (req, res, next) => {
        try {
            // 1. Owner always has access
            if (req.user.workspaceRole === 'Owner') {
                return next();
            }

            // 2. Get the Role definition from DB
            // req.workspace and req.user.workspaceRole are set by workspaceMiddleware
            if (!req.workspace || !req.user.workspaceRole) {
                return res.status(403).json({ msg: 'Workspace context missing' });
            }

            // Find role by name in this workspace
            // Note: In a real system, we might cache this or store Role ID in user team array instead of name
            const role = await Role.findOne({
                workspace: req.workspace._id,
                name: req.user.workspaceRole
            });

            if (!role) {
                // Fallback: If role document not found, maybe allow basic access or deny?
                // For now, deny if strictly checking permissions
                // Special case: 'Admin' string might be hardcoded in some systems without a Role doc
                if (req.user.workspaceRole === 'Admin') return next();

                return res.status(403).json({ msg: 'Role definition not found' });
            }

            // 3. Check specific permission
            if (!role.permissions || !role.permissions[permission]) {
                return res.status(403).json({ msg: `Access denied: Missing ${permission} permission` });
            }

            next();
        } catch (err) {
            console.error('Role Middleware Error:', err.message);
            res.status(500).send('Server Error');
        }
    };
};

module.exports = checkPermission;
