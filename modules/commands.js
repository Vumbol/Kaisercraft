const { say, come, eat } = require('./basic')
const { showWorld } = require('../utils/logs.js');
const { initLumberman } = require('./lumberman.js');
const { initFarmer } = require('./farmer.js');
const { USERS_WHITELIST } = require('../botConfig.js');
const { initDirtFarmer} = require("./dirtFarmer");
const {startPitMan} = require("./pitman");
const botTest = require("./botTest");
const {startFisherMan} = require("./fisherman");


const STUPID_ANSWERS = ["Тут", "Да", "Чо", "че", "+", "иди нахуй", "Да а что?", "Нет", "Нет там блять", "Угу", "Тут я", "Да тут", "М", "чё", "xj", "x`", "xt", "lf", "aua", "Ага", "не", "а"]

function initCommands(bot) {

    let context = {
        isBotTexting: false
    }

    bot.on("chat", (username, message) => {

        console.log(/^Я\] /.test(message), message)

        if (/^Я\] /.test(message) && !context.isBotTexting) {

            if (/тут/i.test(message)) {

                let randomIndex = Math.floor(Math.random() * STUPID_ANSWERS.length)

                let randomTimeout = Math.floor(Math.random() * (100 - 40 + 1)) + 40

                context.isBotTexting = true

                messageWithTimeout(bot, `/msg ${username} ${STUPID_ANSWERS[randomIndex]}`, randomTimeout, context)

            }

        }

        if (USERS_WHITELIST.includes(username)){

          message = message.replace(/^Я\] /, '');

          handleMessage(bot, message, username)
        }
      })

}

function handleMessage(bot, message, username) {

    const commandMatch = message.match(/hui (\w+)/)

    if (commandMatch && commandMatch[1]) {
        const command = commandMatch[1]

        console.log(command)

        if(commands[command]) {
            commands[command](bot, message, username)
        }

    }

}

async function messageWithTimeout (bot, message, timeout, context) {

    await bot.waitForTicks(timeout)

    await bot.chat(message)

    context.isBotTexting = false

}


const commands = {
    // 'mine': initMinerBot,
    // '/kaisercraft follow': followPerson,
    'say': say,
    'showWorld': showWorld,
    'cum': come,
    'lesorub': initLumberman,
    'farmer': initFarmer,
    'dirtfarmer': initDirtFarmer,
    'eat': eat,
    'pitman': startPitMan,
    'test': botTest,
    'fisherman': startFisherMan,
}

module.exports = {
    initCommands,
    messageWithTimeout,
}
