const mongoose = require('mongoose');

// Fonction pour générer un ID unique
function generateGroupId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

const groupSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
    unique: true,
    default: generateGroupId,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  expenses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
    },
  ],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  seuil: {
    type: Number,
    required: false,
    default: 0,
  },
  description: {
    type: String,
    required: false,
    default: '',
  },
  recentPrice: { // Nouveau champ
    type: Number,
    required: false,
    default: 0,
  },
});

module.exports = mongoose.model('Group', groupSchema);
