/* eslint-disable strict */
const express = require('express');
const router = express.Router();

const Quote = require('../models/quote');

router.get('/', (req, res, next) => {
  Quote.find()
    .then(results => res.json(results))
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  console.log('req.body:', req.body.quote);
  const { quote, rating, localSession, cookieSession } = req.body;
  if(!quote) {
    const err = new console.error(('Missing quote in body request'));
    err.status = 400;
    return next(err);
  }

  const insertQuote = { quote, rating, localSession, cookieSession };

  Quote.create(insertQuote)
    .then(results => res
      .location(`${req.originalUrl}/${results.id}`)
      .status(201)
      .json(results))
    .catch(err => next(err));
});

module.exports = router;