
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');

const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require ('./routes/userRoutes')
const app = express();
const PORT = process.env.PORT || 3000; 

connectDB();

app.use(cors()); 
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes )

// teste
app.get('/', (req, res) => {
    res.send('API de Investimentos está funcionando! 🎉');
});


app.listen(PORT, () => {
    console.log(`🚀 Backend rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});