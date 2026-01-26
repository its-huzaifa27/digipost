import AuditLog from '../models/auditLog.model.js';
import User from '../models/user.model.js';

// Internal Helper to create logs
export const logAction = async (userId, action, details, ipAddress = null, entityId = null) => {
    try {
        await AuditLog.create({
            userId,
            action,
            details: typeof details === 'object' ? JSON.stringify(details) : details,
            ipAddress,
            entityId
        });
    } catch (error) {
        console.error('Failed to write audit log:', error);
        // Do not throw, audit logging failure shouldn't crash the main app flow
    }
};

// Get Logs (Paginated)
export const getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { count, rows } = await AuditLog.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            // include: [{ model: User, attributes: ['username', 'email'] }] // Optional if we associate
        });

        res.status(200).json({
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: page,
            logs: rows
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};
