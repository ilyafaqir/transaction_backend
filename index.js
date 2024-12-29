const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/Group');
const expenseRoutes = require('./routes/Expense');
const userRoutes = require('./routes/user');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

mongoose.connect('mongodb+srv://ilyas:2255@cluster0.kcuus.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Base de données connectée'))
.catch(err => console.log('Erreur de connexion à la base de données', err));

app.use('/auth', authRoutes);  
app.use('/groups', groupRoutes);
app.use('/expenses', expenseRoutes);
app.use('/user', userRoutes); 

app.listen(5000, () => {
  console.log('Serveur démarré sur le port 5000');
});
