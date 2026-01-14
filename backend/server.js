const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { db } = require('./config/firebase');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('KaryaSetu Backend is running!');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workers', require('./routes/worker'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/chat', require('./routes/chat'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
