/* eslint-disable strict */
const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  quotes: { type: String, required: true },
  rating: { type: Number },
  localSession: { type: String },
  cookieSession: { type: String }
});

quoteSchema.set('timestamps', true);

quoteSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

module.exports = mongoose.model('Quote', quoteSchema);