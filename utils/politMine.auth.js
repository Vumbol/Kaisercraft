const mineflayerViewer = require('prismarine-viewer').mineflayer

function politMineAuth(bot) {
    bot.once('windowOpen', async (window) => {

        try {
          await bot.clickWindow(20, 0, 0)
        } catch (error) {
          console.log(error)
        }
      })

      bot.once('spawn', async () => {
        // mineflayerViewer(bot, { port: 3008, firstPerson: true })

        // bot.mapDownloader.deactivate()

        await bot.waitForTicks(40)

        bot.setQuickBarSlot(0)
        bot.activateItem()

        await bot.waitForTicks(200)

      })
}

module.exports = {
    politMineAuth,
}
