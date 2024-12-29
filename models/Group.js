const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,   
    default: 0,      
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  expenses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
  }],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  },
  seuil: {  
    type: Number,
    required: false,  
    default: 0, 
  },
});
 
 

module.exports = mongoose.model('Group', groupSchema);
