const mineflayer = require('mineflayer')


// Думаю, лучше перейти на классы
// Класс для установки работ, большинство ботов требуют одну и ту же логику работы с домом, сундуками и сохранением
// Также сюда можно будет в будущем записать логику смены работы, трудоустройства, обей координации и подгрузки задач с сервера
class BotService {
    /**
     * @description Инстанс бота
     * @type {mineflayer.Bot}
     */
    bot

    constructor(bot) {
        this.bot = bot
    }

    async sethome() {

    }

    save() {

    }

    async home() {

    }

    async chooseJob(slot) {
        console.log("start chooseJob")

        // bot.once('windowOpen', async (window) => {

        //     console.log(window)
      
        //     try {
        //       await bot.clickWindow(slot, 0, 0)
        //     } catch (error) {
        //       console.log(error)
        //     }
        // })

        this.bot.chat("/t jobs")

        console.log("/t jobs")

        await this.bot.waitForTicks(10)

        await this.bot.simpleClick.leftMouse(slot, 0, 0)


        console.log(`Job is ${slot} || finish`)
    }

    async isInventoryFull(slot = 0) {
        const emptySlots = this.bot.inventory.emptySlotCount()

        return emptySlots <= slot
    }


}

module.exports = {
    BotService
}