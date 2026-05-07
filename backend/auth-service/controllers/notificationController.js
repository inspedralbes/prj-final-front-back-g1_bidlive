const Notification = require("../models/Notification");

const notificationController = {
  getNotifications: async (req, res) => {
    try {
      const userId = req.user.userId;
      const notifications = await Notification.findByUserId(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      await Notification.markAsRead(id, userId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Mark as read error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.userId;
      await Notification.markAllAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Mark all as read error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  createInternal: async (req, res) => {
    try {
      const { internal_secret } = req.body;
      if (internal_secret !== (process.env.INTERNAL_SECRET || "bidlive_secret")) {
        return res.status(403).json({ message: "Forbidden: Invalid internal secret" });
      }

      const { user_id, title, message, type, link } = req.body;
      if (!user_id || !title || !message) {
        return res.status(400).json({ message: "user_id, title and message are required" });
      }

      await Notification.create({ user_id, title, message, type, link });
      res.status(201).json({ message: "Notification created successfully" });
    } catch (error) {
      console.error("Create internal notification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

module.exports = notificationController;
