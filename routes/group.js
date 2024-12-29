const express = require('express');
const Group = require('../models/Group'); // Assurez-vous d'avoir un modèle Group
const Expense = require('../models/Expense');
const router = express.Router();
const mongoose = require('mongoose');

// Créer un groupe
router.post('/', async (req, res) => {
    const { name, price, adminId } = req.body;  // `price` et `adminId` sont passés dans la requête
  
    try {
      const group = new Group({
        name,
        price,  // Le prix du groupe
        admin: adminId,  // L'ID de l'administrateur
      });
      await group.save();
      res.status(201).json({ message: 'Groupe créé avec succès', group });
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  });
  

router.put('/subtract/:groupId', async (req, res) => {
    const { groupId } = req.params; // Récupère l'ID du groupe
    const { amount } = req.body; // Montant à soustraire
  
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Montant invalide pour la soustraction.' });
    }
  
    try {
      // Trouver le groupe par son ID
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
  
      // Ajouter le montant au prix
      group.price += amount;
  
      // Sauvegarder la modification
      await group.save();
  
      res.status(200).json({ message: 'Montant ajouté avec succès.', group });
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  });
  

// Lister les groupes
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.post('/:groupId/expenses', async (req, res) => {
  const { groupId } = req.params; // ID du groupe
  const { name, amount, description, userId } = req.body; // Données de la dépense

  if (!name || !amount) {
    return res.status(400).json({ message: 'Nom et montant de la dépense sont requis.' });
  }

  try {
    // Vérifier si userId est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utilisateur invalide.' });
    }

    // Créer une nouvelle dépense
    const expense = new Expense({
      name,
      amount,
      description,
      user: new mongoose.Types.ObjectId(userId),  // Utilisation de 'new' pour créer l'ObjectId
    });

    // Sauvegarder la dépense dans la base de données
    await expense.save();

 
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Groupe non trouvé.' });
    }

  
    group.expenses.push(expense._id);

    // Sauvegarder les changements dans le groupe
    await group.save();

    res.status(201).json({ message: 'Dépense ajoutée avec succès.', expense });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});
// Trouver un groupe par son ID
// Trouver les participants d'un groupe
router.get('/:groupId/participants', async (req, res) => {
  const { groupId } = req.params; // ID du groupe passé dans les paramètres

  try {
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'ID du groupe invalide.' });
    }

    // Trouver le groupe avec les participants
    const group = await Group.findById(groupId).populate('participants'); // Populate pour récupérer les détails des utilisateurs

    if (!group) {
      return res.status(404).json({ message: 'Groupe non trouvé.' });
    }

    res.status(200).json({ participants: group.participants });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


 

 


module.exports = router;
