import ModerationReport from "../models/ModerationReport.js";

export const createModerationReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, details = "" } = req.body;
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: "targetType, targetId and reason are required" });
    }

    const report = await ModerationReport.create({
      targetType,
      targetId,
      reason: reason.trim(),
      details: details.trim(),
      reportedBy: req.user._id,
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: "Failed to submit report" });
  }
};

export const getAdminReports = async (req, res) => {
  try {
    const reports = await ModerationReport.find()
      .populate("reportedBy", "name email role")
      .populate("resolvedBy", "name email role")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch moderation reports" });
  }
};

export const resolveAdminReport = async (req, res) => {
  try {
    const { resolutionNote = "" } = req.body;
    const report = await ModerationReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = "resolved";
    report.resolutionNote = resolutionNote;
    report.resolvedBy = req.user._id;
    await report.save();

    res.json(report);
  } catch (error) {
    res.status(400).json({ message: "Failed to resolve report" });
  }
};
