const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("🟢 Connesso a MongoDB"))
.catch(err => console.error("🔴 Errore connessione MongoDB:", err));

// Aggiungeremo qui le rotte man mano

module.exports = app;
