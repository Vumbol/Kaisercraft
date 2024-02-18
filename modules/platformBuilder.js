const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const GoalNear = goals.GoalNear;
const toolPlugin = require("mineflayer-tool").plugin;
const autoeat = require("mineflayer-auto-eat").plugin;
// const  blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer)
const Vec3 = require("vec3");
const { BotService } = require("../classes/BotService");
const { USERS_WHITELIST } = require("../botConfig");

let log_type = 'birch_log'
let sapling_type = 'birch_sapling'

function initLumberman(bot, message, username) {
  console.log("Init lumberwomen")

  bot.loadPlugin(pathfinder)
  bot.loadPlugin(toolPlugin)
  bot.loadPlugin(autoeat)

  bot.on("autoeat_started", (item, offhand) => {
    console.log(`Eating ${item.name} in ${offhand ? "offhand" : "hand"}`);
  });
}

function initLumbermanCommands(bot) {
  console.log("initLumbermanCommands")

  bot.on("chat", async (username, message) => {
    console.log(username, message);

    if (!USERS_WHITELIST.includes(username)) return;

    message = message.replace(/^Я\] /, "");

    console.log(username, message);

    switch (message) {
      case "platforma":
        startBuild(bot);
        break;
    }
  });
}

let currentCount = 0

async function startBuild(bot) {
  
}

module.exports = {
  initLumberman,
};
