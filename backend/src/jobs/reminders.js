"use strict";
const cron = require("node-cron");
const { EmployeeTool } = require("../models/EmployeeTool");
const { sendCalendarReminder } = require("../services/email.service");
const { logger } = require("../utils/logger");

async function deliverDueReminders() {
    const now = new Date();
    const staleClaim = new Date(now.getTime() - 5 * 60_000);
    const due = await EmployeeTool.find({
        kind: { $in: ["meeting", "reminder"] },
        reminderAt: { $lte: now },
        reminderSentAt: null,
        startsAt: { $gt: now },
        $or: [{ reminderClaimedAt: null }, { reminderClaimedAt: { $lt: staleClaim } }],
    }).sort({ reminderAt: 1 }).limit(100).populate("userId", "name email").lean();

    for (const event of due) {
        const claimedAt = new Date();
        const claim = await EmployeeTool.updateOne({
            _id: event._id,
            reminderSentAt: null,
            $or: [{ reminderClaimedAt: null }, { reminderClaimedAt: { $lt: staleClaim } }],
        }, { $set: { reminderClaimedAt: claimedAt } });
        if (claim.modifiedCount !== 1)
            continue;

        try {
            if (!event.userId?.email)
                throw new Error("Calendar reminder has no recipient email");
            await sendCalendarReminder({
                to: event.userId.email,
                name: event.userId.name,
                title: event.title,
                startsAt: event.startsAt,
                description: event.description,
            });
            await EmployeeTool.updateOne({ _id: event._id, reminderClaimedAt: claimedAt }, {
                $set: { reminderSentAt: new Date() },
                $unset: { reminderClaimedAt: 1 },
            });
        }
        catch (error) {
            await EmployeeTool.updateOne({ _id: event._id, reminderClaimedAt: claimedAt }, {
                $set: { reminderClaimedAt: null },
            });
            logger.error({ err: error, eventId: event._id.toString() }, "Calendar reminder delivery failed");
        }
    }
}

function startReminderJob() {
    return cron.schedule("* * * * *", () => {
        void deliverDueReminders().catch((error) => {
            logger.error({ err: error }, "Calendar reminder job failed");
        });
    });
}

module.exports = { startReminderJob, deliverDueReminders };
