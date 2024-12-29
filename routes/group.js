const express = require('express');
const Group = require('../models/Group'); // Assurez-vous d'avoir un modèle Group
const Expense = require('../models/Expense');
const router = express.Router();
const mongoose = require('mongoose');

// Créer un groupe
router.post('/', async (req, res) => {
    const { name, price, adminId ,seuil} = req.body;   
  
    try {
      const group = new Group({
        name,
        price,  
        admin: adminId,   
        seuil,
      });
      await group.save();
      res.status(201).json({ message: 'Groupe créé avec succès', group });
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  });
  

router.put('/subtract/:groupId', async (req, res) => {
    const { groupId } = req.params;  
    const { amount } = req.body; 
  
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Montant invalide pour la soustraction.' });
    }
  
    try {
   
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Groupe non trouvé.' });
      }
  
    
      group.price -= amount;
  
      
      await group.save();
  
      res.status(200).json({ message: 'Montant soustrait avec succès.', group });
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  });
  
  router.put('/add/:groupId', async (req, res) => {
    const { groupId } = req.params; // ID du groupe à modifier
    const { amount } = req.body; // Montant à ajouter
  
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Montant invalide pour l\'ajout.' });
    }
  
    try {
      // Trouver le groupe par son ID
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Groupe non trouvé.' });
      }
  
 
      group.price += amount;
  
   
      await group.save();
  
      res.status(200).json({ message: 'Montant ajouté avec succès.', group });
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  });
  

 
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.post('/:groupId/expenses', async (req, res) => {
  const { groupId } = req.params; 
  const { name, amount, description, userId } = req.body; 

  if (!name || !amount) {
    return res.status(400).json({ message: 'Nom et montant de la dépense sont requis.' });
  }

  try { 
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utilisateur invalide.' });
    }
 
    const expense = new Expense({
      name,
      amount,
      description,
      user: new mongoose.Types.ObjectId(userId),  
    });

 
    await expense.save();

 
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Groupe non trouvé.' });
    }

  
    group.expenses.push(expense._id);
    await group.save();

    res.status(201).json({ message: 'Dépense ajoutée avec succès.', expense });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});
 
// Trouver les participants d'un groupe
router.get('/:groupId/participants', async (req, res) => {
  const { groupId } = req.params;  

  try {
     
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'ID du groupe invalide.' });
    }

  
    const group = await Group.findById(groupId).populate('participants') 

    if (!group) {
      return res.status(404).json({ message: 'Groupe non trouvé.' });
    }

    res.status(200).json({ participants: group.participants });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
})


module.exports = router;
