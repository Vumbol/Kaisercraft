const express = require('express');
const userRoutes = require('./api/bot/botRoutes');
const path = require('path');
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3333;

// TODO: prod
app.use(cors())

app.use('/api/bot', userRoutes);

app.use(express.static(path.join(__dirname, 'public')))

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
