const express = require('express');
const router = express.Router();
const BotController = require('./botController');

// Маршруты bot
router.post('/loginBot/:botName', BotController.loginBotToServer);
router.post('/stopBot/:botName', BotController.quitBotFromServer);

module.exports = router;
