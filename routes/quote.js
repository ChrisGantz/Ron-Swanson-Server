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
  let ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  const { quote, userVotes } = req.body;
  userVotes[0].userIp = ip;
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
  // get ip of user then check if they have voted before if they havent accept req and push new vote info
  let ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
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
      newVote.userIp = ip;
      const updateVoters = { $push: { userVotes: newVote } };
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