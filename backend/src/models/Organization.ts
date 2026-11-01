import { Schema, model, models, type InferSchemaType } from "mongoose";
import { getConfig } from "../config/env";

const organizationSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  minGroupSize: { type: Number, min: 5, max: 100, default: () => getConfig().MIN_PULSE_GROUP_SIZE },
}, { timestamps: true });

export type OrganizationDocument = InferSchemaType<typeof organizationSchema>;
export const Organization = models.Organization || model("Organization", organizationSchema);
