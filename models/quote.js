/* eslint-disable strict */
const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  quote: { type: String, required: true },
  userVotes: [
    {
      localSession: { type: String },
      cookieSession: { type: String },
      rating: { type: Number }
    }
  ]
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