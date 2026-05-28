import Notification from "../models/Notification.js";

export const getMyNotifications = async (req, res) => {
  try {
    const list = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const item = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Notification not found" });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: "Failed to update notification" });
  }
};
