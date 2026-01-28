const app = require('./app');

app.get('/', (req, res) => {
    res.send('KaryaSetu Backend is running!');
});

// For local development
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
