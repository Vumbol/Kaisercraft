const mineflayer = require('mineflayer')
const { BOT_CONFIG_2, BOT_CONFIG } = require('./botConfig')
const { politMineAuth } = require('./utils/politMine.auth')
const { initCommands } = require('./modules/commands')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const { pathfinder } = require('mineflayer-pathfinder')
const toolPlugin = require('mineflayer-tool').plugin
const { initLumberman } = require('./modules/lumberman')

// !! Старый способ мануально запускать ботов, 1 Node ENV = 1 бот
// Сейчас использую start_server и API для управления ботами

try {
    function initBot() {

        console.log(process.argv)

        let CONFIG = {}

        if ( process.argv[2] ) {

            CONFIG = {
                username: process.argv[2],
                // password: 'mega228nasral',
                host: 'mc.politmine.ru',
                // host: 'localhost',
                closeTimeout: 300*1000,
                version: "1.16.4",
                // port: '61704'
              }

        } else {
            // GET CONFIG FROM LOCAL
        }


        const bot = mineflayer.createBot(CONFIG)

        bot.loadPlugin(pathfinder)
        bot.loadPlugin(toolPlugin)

        politMineAuth(bot)

        initCommands(bot)

        bot.on('kicked', (err) => {
            // initBot()
            console.log(err)
        })
        bot.on('error', (err) => {
            // initBot()
            console.log(err)
        })
    }
} catch (error) {
    console.log(error)

    setTimeout(() => {
        initBot()
    }, 20000)

}



initBot()
// initMinerBot(bot)
