// models/StoreSettings.ts
import mongoose, { Schema, model, models } from 'mongoose';

const StoreSettingsSchema = new Schema({
  localCharge: { type: Number, required: true, default: 50 },
  gaovCharge: { type: Number, required: true, default: 80 },
}, { timestamps: true });

const StoreSettings = models.StoreSettings || model('StoreSettings', StoreSettingsSchema);

export default StoreSettings;