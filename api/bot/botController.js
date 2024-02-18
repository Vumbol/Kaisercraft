const BotService = require('./botService');

/**
 * @description Тут не совсем привычный контроллер, так как идёт работа с ботами и их списком
 * Возможно потом переделаю
 *
 * Получаем бота через BotList, туда же складываем, а вот всю остальную логику перенёс в сервис
 */

// Переделать
const BotList = []

module.exports = {

  async loginBotToServer(req, res) {
    try {
      const bot = await BotService.loginBotToServer(req.params.botName)

      BotList.push(bot)

      if (!bot) {
        return res.status(404).json({ message: 'Bot not found' });
      }
      res.json(bot);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async quitBotFromServer(req, res) {

    try {

      const bot = BotList.find(
        bot => bot.username === req.params.botName
      )

      if (!bot) {
        return res.status(404).json({ message: 'Bot not found' });
      }

      await bot.end()

      res.json(bot)

    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  }

}
