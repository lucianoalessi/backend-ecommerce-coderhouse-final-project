import mongoose from 'mongoose';

const RESET_CODES_COLLECTION = 'resetPasswordCodes';
const EXPIRATION_TIME_SECONDS = 360;

const resetPasswordCodeSchema = new mongoose.Schema({
  email: { 
      type: String, 
      required: true,
      match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Por favor, introduce un correo electrónico válido.'] 
  },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: EXPIRATION_TIME_SECONDS }
});

export const resetPasswordCodeModel = mongoose.model(RESET_CODES_COLLECTION, resetPasswordCodeSchema);