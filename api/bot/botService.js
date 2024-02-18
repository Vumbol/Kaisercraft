const BotFactory = require("../../bot/botFactory");

const BotList = []

module.exports = {

  loginBotToServer(botName) {

    // Потом можно перенести все настройки в req.body
    const botConfig = {
      username: botName,
      // password: 'mega228nasral',
      host: 'mc.politmine.ru',
      // host: 'localhost',
      closeTimeout: 300*1000,
      version: "1.16.4",
      // port: '54505'
    }

    return BotFactory.createBot(botConfig)
  }

}
