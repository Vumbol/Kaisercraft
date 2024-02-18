const { Bot } = require("mineflayer");

class BotWrapper {

  /**
   * @type { Bot }
   */
  bot

  constructor(bot) {

    // Тут можно подключать все нужные сервисы для бота
    this.bot = bot

  }

  getBotInventoryStatus() {
    return this.bot.inventory
  }

}

module.exports = {
  BotWrapper
}