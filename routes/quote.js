/* eslint-disable strict */
const express = require('express');
const router = express.Router();

const Quote = require('../models/quote');

router.get('/', (req, res, next) => {
  console.log('req.ip ', req.ip);
  let ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  console.log('ip:', ip);
  Quote.find()
    .then(results => res.json(results))
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  let ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  console.log('ip:post', ip);
  const { quote, userVotes } = req.body;
  // userVotes[0].userIp = ip;
  if(!quote) {
    const err = new console.error(('Missing quote in body request'));
    err.status = 400;
    return next(err);
  }
  const insertQuote = { quote, userVotes };

  Quote.create(insertQuote)
    .then(results => res
      .location(`${req.originalUrl}/${results.id}`)
      .status(201)
      .json(results))
    .catch(err => next(err));
});

router.put('/', (req, res, next) => {
  const { quote, newVote } = req.body;
  const updateVoters = { $push: { userVotes: newVote} };
  // let ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  const ip = '192.168.1.55';
  const checkIfUserVoted = {quote: quote, userVotes: {$elemMatch: {userIp: ip}}};
  return Quote.find(checkIfUserVoted)
    .count()
    .then(count => {
      console.log('count:', count);
      // check if ip address had been used to vote
      if(count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'Validation Error',
          message: 'You voted already',
          location: 'userVotes'
        });
      }
      return Quote.findOneAndUpdate({quote: quote}, updateVoters, { new: true });
    })
    .then(results => res.status(201).json(results))
    .catch(err => {
      // Send error to client to be handled
      if(err.reason === 'Validation Error') {
        return res.status(err.code).json(err);
      }
      next(err);
    });
});

module.exports = router;