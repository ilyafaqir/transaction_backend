const express = require('express');
const Group = require('../models/Group');  
const Expense = require('../models/Expense');
const router = express.Router();
const mongoose = require('mongoose');

// Créer un groupe
router.post('/', async (req, res) => {
  const { name, price, adminId, seuil } = req.body;   
  try {
      const group = new Group({
          name,
          price,  
          admin: adminId,   
          seuil,
          participants: [adminId],   
      });
      await group.save();
      res.status(201).json({ message: 'Groupe créé avec succès', group });
  } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }

});
router.post('/add-participant', async (req, res) => {
  const { groupId, participantId } = req.body;   

  if (!groupId || !participantId) {
    return res.status(400).json({ message: 'ID du groupe et ID du participant requis.' });
  }

  try {
    
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Groupe non trouvé.' });
    }

    
    const user = await User.findById(participantId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    
    if (group.participants.includes(participantId)) {
      return res.status(400).json({ message: 'Le participant est déjà dans ce groupe.' });
    }

     
    group.participants.push(participantId);

     
    user.groups.push(groupId);
 
    await group.save();
    await user.save();

    res.status(200).json({ message: 'Participant ajouté avec succès au groupe.', group, user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


router.post('/subtract', async (req, res) => {
  const { groupId, amount, userId, description } = req.body;  
 
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Montant invalide pour la soustraction.' });
  }

  try {
 
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Groupe non trouvé.' });
    }
 
    group.price -= amount;
    const newExpense = new Expense({
      name: 'Soustraction du groupe',  
      amount: amount,
      description: description || 'Aucune description',
      user: userId,   
      groupId: groupId  
    });

 
    await newExpense.save();

 
    group.expenses.push(newExpense._id);  
    await group.save();

  
    res.status(200).json({ message: 'Montant soustrait avec succès.', expense: newExpense });

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

 
  router.post('/add', async (req, res) => {
    const { groupId, amount, userId, description } = req.body;   
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Montant invalide pour l\'ajout.' });
    }
  
    try {
  
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Groupe non trouvé.' });
      }
  
      
      group.price += amount;
  
      // Créer une nouvelle dépense liée à ce groupe et à un utilisateur
      const newExpense = new Expense({
        name: 'Ajout au groupe',  
        amount: amount,
        description: description || 'Aucune description', 
        user: userId,   
        groupId: groupId 
      });
  
 
      await newExpense.save();
  
     
      group.expenses.push(newExpense._id);  
  
     
      await group.save();
  
    
      res.status(200).json({ message: 'Montant ajouté avec succès.', expense: newExpense });
  
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  });
  
  

 ////http://localhost:5000/groups/
 //c est pas important mais juste pour visualiser les groupe
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});
 


router.post('/participants', async (req, res) => {
  const { groupId } = req.body;  // Recevoir groupId dans le corps de la requête

  try {
    
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'ID du groupe invalide.' });
    }

    
    const group = await Group.findById(groupId).populate('participants'); 

    if (!group) {
      return res.status(404).json({ message: 'Groupe non trouvé.' });
    }

    res.status(200).json({ participants: group.participants });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});



module.exports = router;
