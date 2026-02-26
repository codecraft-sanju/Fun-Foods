// models/MenuItem.ts
import mongoose, { Schema, model, models } from 'mongoose';

const MenuItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  price: { type: Number, required: true },
  type: { type: String, required: true },
  image: { type: String, required: true },
  // Yaha naya change hoga
compareAtPrice: {
  type: Number,
  required: false, 
},
}, { timestamps: true });

const MenuItem = models.MenuItem || model('MenuItem', MenuItemSchema);

export default MenuItem;