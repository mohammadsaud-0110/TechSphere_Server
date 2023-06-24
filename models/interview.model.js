const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  communication: {
    type: Array
  },
  technical: {
    type: Array
  },
  communicationAVG:{
    type: Number
  },
  technicalAVG:{
    type: Number
  }
});

const InterviewModel = new mongoose.model('interview', interviewSchema);

module.exports = {
    InterviewModel
}