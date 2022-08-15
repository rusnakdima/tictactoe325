const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statsSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
  winnings: {
    type: Number,
    required: true,
  },
  draws: {
    type: Number,
    required: true,
  },
  losses: {
    type: Number,
    required: true,
  },
});

const Stats = mongoose.model('Stats', statsSchema);

module.exports = Stats;