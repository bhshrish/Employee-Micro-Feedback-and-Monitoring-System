import { Schema, model, models } from "mongoose";
const attendanceSchema = new Schema({
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    checkedInAt: { type: Date, required: true, index: true },
    checkedOutAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: null, min: 0 },
}, { timestamps: true });
attendanceSchema.index({ userId: 1, checkedInAt: -1 });
attendanceSchema.index({ userId: 1 }, { unique: true, partialFilterExpression: { checkedOutAt: null } });
export const Attendance = models.Attendance || model("Attendance", attendanceSchema);