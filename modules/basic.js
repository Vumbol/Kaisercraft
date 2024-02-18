const { goals } = require('mineflayer-pathfinder')
const GoalNear = goals.GoalNear
const autoeat = require("mineflayer-auto-eat").plugin

function say (bot, message, username) {
    
    try {

        const messageMatch = message.match(/hui say "(.*?)"/)
        console.log("MESSAGE", message, messageMatch)
    
        const response = messageMatch[1]
    
        bot.chat(response)

    } catch (error) {

        bot.chat(`/msg ${username} Шёл бы ты нахуй`) 

    }

}

function eat (bot) {
    bot.loadPlugin(autoeat)

    bot.autoEat
    .eat(true)
    .then((successful) => {
        console.log('Finished executing eating function', successful)
    })
    .catch((error) => {
        console.error(error)
    })
}


function come (bot, message, username) {
    console.log("Come function")
    const target = bot.players[username]?.entity
    if (!target) {
      bot.chat("/msg username Шёл бы ты нахуй!")
    }
    const { x: playerX, y: playerY, z: playerZ } = target.position
    bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, 1))
}

module.exports = {
    say,
    come,
    eat,
}