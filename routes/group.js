const express = require('express');
const Group = require('../models/Group');  
const Expense = require('../models/Expense');
const User = require('../models/User'); // Ajustez le chemin d'accès en fonction de votre structure de dossiers
// Assurez-vous que Group est également importé correctement

const router = express.Router();
const mongoose = require('mongoose');

// Créer un groupe
router.post('/', async (req, res) => {
  const { name, price, adminId, seuil ,description} = req.body;   
  try {
      const group = new Group({
          name,
          price,  
          admin: adminId,   
          seuil,
          participants: [adminId],   
          description,
      });
      await group.save();
      res.status(201).json({ message: 'Groupe créé avec succès', group });
  } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }

});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/add-participant', async (req, res) => {
  const { groupId, participantId } = req.body; 

  if (!groupId || !participantId) {
    return res.status(400).json({ message: 'ID du groupe et ID du participant requis.' });
  }

  try {
    // Trouver le groupe par son ID
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Groupe non trouvé.' });
    }

    
    const user = await User.findById(participantId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Vérifier si le participant est déjà dans le groupe
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
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


router.post('/subtract', async (req, res) => {
  const { groupId, amount, userId, description } = req.body;  // Recevoir groupId, amount, userId et description dans le corps de la requête

  // Vérifier si le montant est valide
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

 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  router.post('/add', async (req, res) => {
    const { groupId, amount, userId, description } = req.body;  // Recevoir groupId, amount, userId et description dans le corps de la requête
  
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Montant invalide pour l\'ajout.' });
    }
  
    try {

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Groupe non trouvé.' });
      }
  
      // Ajouter le montant au prix du groupe
      group.price += amount;
  
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
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


 ////http://localhost:5000/groups/
 //c est pas important mais juste pour visualiser les groupe
 router.get('/', async (req, res) => {
  try {
  
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({ message: 'adminId est requis.' });
    }

    const groups = await Group.find({ admin: adminId });

    if (groups.length === 0) {
      return res.status(404).json({ message: 'Aucun groupe trouvé pour cet utilisateur.' });
    }

    res.status(200).json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


router.post('/participants', async (req, res) => {
  const { groupId } = req.body;  

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

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
   
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Groupe non trouvé' });
    }

    await Group.findByIdAndDelete(id);

    res.status(200).json({ message: 'Groupe supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du groupe:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du groupe' });
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Route pour trouver un groupe par son ID et lister les informations
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({ message: "groupId est requis." });
    }

    const group = await Group.findById(groupId)
      .populate('admin', 'name email') 
      .populate('participants', 'name email') 
      .populate('expenses'); 


    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé." });
    }

    res.status(200).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Recherche de l'utilisateur par son ID
    const user = await User.findById(userId).populate('groups');  // Vous pouvez peupler les groupes si vous souhaitez les inclure dans la réponse

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    
    res.status(200).json(user);  // Retourner les informations de l'utilisateur trouvé
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/user-groups/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utilisateur invalide.' });
    }

    // Recherche de tous les groupes où l'utilisateur est un participant
    const groups = await Group.find({ participants: userId })
      .populate('admin', 'name')  // Inclure uniquement le nom de l'admin
      .populate('participants', 'name email')  // Peupler les participants du groupe
      .populate('expenses');  // Peupler les dépenses du groupe

    // Vérifier si des groupes ont été trouvés
    if (groups.length === 0) {
      return res.status(404).json({ message: "Aucun groupe trouvé pour cet utilisateur." });
    }

    // Si l'utilisateur fait partie des participants, retourner les groupes
    res.status(200).json(groups);  
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/add-expense', async (req, res) => {
  const { groupId, name, amount, description, userId } = req.body;

  // Validation des données
  if (!groupId || !name || !amount || !userId) {
    return res.status(400).json({ message: 'groupId, name, amount et userId sont requis.' });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: 'Le montant doit être supérieur à zéro.' });
  }

  try {
    // Trouver le groupe par ID
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Groupe non trouvé.' });
    }

    // Vérifier si l'utilisateur est un participant du groupe
    if (!group.participants.includes(userId)) {
      return res.status(403).json({ message: 'Utilisateur non autorisé à ajouter une dépense dans ce groupe.' });
    }

    // Créer une nouvelle dépense
    const newExpense = new Expense({
      name,
      amount,
      description: description || 'Aucune description',
      user: userId,
      groupId,
    });

    // Sauvegarder la dépense
    await newExpense.save();

    // Ajouter l'ID de la dépense au groupe
    group.expenses.push(newExpense._id);

    // Sauvegarder le groupe
    await group.save();

    res.status(201).json({ message: 'Dépense ajoutée avec succès.', expense: newExpense });
  } catch (err) {
    console.error('Erreur lors de l\'ajout de la dépense :', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/group/:id/expenses', async (req, res) => {
  try {
    const groupId = req.params.id;

    // Rechercher toutes les dépenses liées à ce groupe
    const expenses = await Expense.find({ groupId }).populate('user', 'name'); // Populate pour inclure des détails sur l'utilisateur

    // Vérifier si des dépenses existent pour ce groupe
    if (!expenses || expenses.length === 0) {
      // Renvoi d'un tableau vide et d'un message, mais avec un statut 200
      return res.status(200).json({ message: 'Aucune dépense trouvée pour ce groupe', expenses: [] });
    }

    // Retourner les dépenses
    res.json(expenses);
  } catch (error) {
    console.error('Erreur lors de la récupération des dépenses :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});




router.post('/update-group-expenses/:groupId', async (req, res) => {
  try {
    // Récupérer l'ID du groupe depuis les paramètres de la route
    const groupId = req.params.groupId;

    // Récupérer toutes les dépenses associées à ce groupe
    const expenses = await Expense.find({ groupId });

    // Calculer la somme totale des montants des transactions
    const totalExpenseAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Récupérer le groupe
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Groupe non trouvé' });
    }

    // Calculer le nouveau prix en soustrayant la somme des montants des transactions du prix initial
    const newPrice = group.price - totalExpenseAmount;

    // Mettre à jour le champ recentPrice avec le nouveau montant calculé
    group.recentPrice = newPrice;

    // Sauvegarder les modifications dans le groupe
    await group.save();

    // Retourner la réponse avec le nouveau prix du groupe, recentPrice et les prix des transactions
    res.status(200).json({
      message: 'Le montant du groupe a été mis à jour avec succès.',
      recentPrice: group.recentPrice,
      price: group.price,
      transactionPrices: expenses.map(expense => expense.amount), 
      seuil:group.seuil,// Liste des prix des transactions
      idG:group.groupId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});



router.post('/join-group', async (req, res) => {
  try {
    const { userId, groupId } = req.body;

    // Vérification des entrées
    if (!userId || !groupId) {
      return res.status(400).json({ message: "L'ID utilisateur et le code du groupe sont requis." });
    }

    // Vérification de l'ID utilisateur valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID utilisateur invalide." });
    }

    // Vérification de la validité du groupId
    if (typeof groupId !== 'string' || groupId.trim() === '') {
      return res.status(400).json({ message: "ID du groupe invalide." });
    }

    // Recherche du groupe avec le `groupId`
    const group = await Group.findOne({ groupId });

    // Vérification si le groupe existe
    if (!group) {
      return res.status(404).json({ message: "Aucun groupe trouvé avec ce code." });
    }

    // Vérification si l'utilisateur est déjà dans le groupe
    if (group.participants.includes(userId)) {
      return res.status(400).json({ message: "L'utilisateur est déjà membre de ce groupe." });
    }

    // Ajouter l'utilisateur aux participants
    group.participants.push(userId);
    await group.save();

    return res.status(200).json({ message: "Utilisateur ajouté au groupe avec succès.", group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

router.get('/:groupId/participants', async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({ message: "groupId est requis." });
    }

    // Trouver le groupe et récupérer les informations des participants
    const group = await Group.findById(groupId).populate('participants', '_id name email');

    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé." });
    }

    // Retourner seulement les infos nécessaires des utilisateurs
    res.status(200).json({ users: group.participants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
  
});
router.get('/:groupId/info', async (req, res) => {
  try {
    const groupId = req.params.groupId;
    
    // Récupérer le groupe par son ID
    const group = await Group.findById(groupId).populate({
      path: 'expenses',
      select: 'name amount description date'
    });  // Assure-toi que 'expenses' est bien peuplé

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Extraire les informations du groupe
    const groupInfo = {
      groupId: group._id,
      initialPrice: group.price,
      recentPrice: group.recentPrice,
      transactions: [],
    };

    // Récupérer les informations des transactions et les formater
    group.expenses.forEach(expense => {
      groupInfo.transactions.push({
        transactionName: expense.name,
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
      });
    });

    // Envoyer la réponse
    res.json(groupInfo);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
})


module.exports = router;
