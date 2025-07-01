const Schedule = require("../models/schedule");

exports.getUserSchedule = async (req, res) => {
  try {
    const { adminId } = req.params;
    const schedule = await Schedule.findOne({ adminId });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.setAdminSchedule = async (req, res) => {
  try {
    const { adminId, mode, days } = req.body;
    const schedule = await Schedule.findOneAndUpdate(
      { adminId },
      { adminId, mode, days },
      { upsert: true, new: true }
    );
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: "Failed to set schedule" });
  }
};

exports.clearSchedule = async (req, res) => {
  try {
    const { adminId } = req.params;
    await Schedule.deleteOne({ adminId });
    res.json({ message: "Schedule cleared" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear schedule" });
  }
};

exports.copyMondayToAll = async (req, res) => {
  try {
    const { adminId } = req.params;
    const schedule = await Schedule.findOne({ adminId });
    if (!schedule) return res.status(404).json({ message: "Not found" });

    const monday = schedule.days.find((d) => d.day === "MON");
    if (!monday) return res.status(400).json({ message: "Monday not found" });

    const copiedDays = ["TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => ({
      day,
      slots: monday.slots,
    }));

    schedule.days = [{ day: "MON", slots: monday.slots }, ...copiedDays];
    await schedule.save();

    res.json({ message: "Copied Monday to all days", schedule });
  } catch (err) {
    res.status(500).json({ message: "Failed to copy" });
  }
};
