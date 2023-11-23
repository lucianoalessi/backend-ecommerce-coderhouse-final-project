import mongoose from 'mongoose';

const RESET_CODES_COLLECTION = 'resetCodes';
const EXPIRATION_TIME_SECONDS = 3600;

const resetCodeSchema = new mongoose.Schema({
  email: { 
      type: String, 
      required: true,
      match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Por favor, introduce un correo electrónico válido.'] 
  },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, expires: EXPIRATION_TIME_SECONDS }
});

export const resetCodeModel = mongoose.model(RESET_CODES_COLLECTION, resetCodeSchema);