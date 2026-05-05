import { Router } from 'express';
import Notification from '../../../models/Notification.js';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js';

export const notificationRouter = Router();

function serializeNotification(notification) {
  return {
    id: String(notification._id),
    message: notification.message,
    type: notification.type,
    targetId: String(notification.target),
    targetModel: notification.targetModel,
    isRead: Boolean(notification.isRead),
    createdAt: notification.updatedAt ?? notification.createdAt,
  };
}

notificationRouter.get(
  '/',
  requireAuth,
  requireRole('student'),
  async (req, res, next) => {
    try {
      const [notifications, unreadCount] = await Promise.all([
        Notification.find({ student: req.user._id })
          .sort({ updatedAt: -1 })
          .limit(20)
          .lean(),
        Notification.countDocuments({ student: req.user._id, isRead: false }),
      ]);

      res.status(200).json({
        notifications: notifications.map(serializeNotification),
        unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }
);

notificationRouter.patch(
  '/read',
  requireAuth,
  requireRole('student'),
  async (req, res, next) => {
    try {
      const result = await Notification.updateMany(
        { student: req.user._id, isRead: false },
        { $set: { isRead: true } }
      );

      res.status(200).json({
        message: 'Notifications marked as read',
        updatedCount: result.modifiedCount,
      });
    } catch (error) {
      next(error);
    }
  }
);

notificationRouter.delete(
  '/',
  requireAuth,
  requireRole('student'),
  async (req, res, next) => {
    try {
      const result = await Notification.deleteMany({ student: req.user._id });

      res.status(200).json({
        message: 'Notifications deleted',
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      next(error);
    }
  }
);
