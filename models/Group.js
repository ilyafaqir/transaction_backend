const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,  // Vous pouvez définir "required: true" si vous voulez qu'un prix soit obligatoire.
    default: 0,      // Définir une valeur par défaut si nécessaire
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
    required: true,  // Le champ admin est requis car un groupe doit avoir un administrateur.
  },
});
// Ajouter une dépense à un groupe
 

module.exports = mongoose.model('Group', groupSchema);
