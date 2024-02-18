const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const GoalNear = goals.GoalNear;
const toolPlugin = require("mineflayer-tool").plugin;
const autoeat = require("mineflayer-auto-eat").plugin;
// const  blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer)
const Vec3 = require("vec3");
const { BotService } = require("../classes/BotService");
const {USERS_WHITELIST} = require("../botConfig");


function initDirtFarmer(bot, message, username) {

  bot.loadPlugin(pathfinder)
  bot.loadPlugin(toolPlugin)
  bot.loadPlugin(autoeat)

  bot.on("autoeat_started", (item, offhand) => {
    console.log(`Eating ${item.name} in ${offhand ? "offhand" : "hand"}`);
  });


  initDirtFarmerCommands(bot)

}

function initDirtFarmerCommands(bot) {

  bot.on("chat", async (username, message) => {

    if (!USERS_WHITELIST.includes(username)) return

    message = message.replace(/^Я\] /, "")

    switch (message) {
      case "dirtfarm":
        mineDirt(bot);
        break;
      case "inv": handleFullInventory(bot); break;
    }
  })

}

let currentCount = 0

async function mineDirt(bot) {

  const botService = new BotService(bot)

  const isInventoryFull = await botService.isInventoryFull()

  // console.log(isInventoryFull)


  if(isInventoryFull) {
    console.log("handleFullInventory")

    handleFullInventory(bot)

    return
  }

  currentCount++

  console.log("[dirt miner] block counter:", currentCount)

  if (currentCount === 10) {

    await searchLoot(bot)

    currentCount = 0

  }

  console.log('start mine dirt')

  const mcData = require("minecraft-data")(bot.version);

  const nearestDirtBlock = await bot.findBlock({
    matching: mcData.blocksByName['dirt'].id,
    maxDistance: 256,
  })

  const blockPosition = nearestDirtBlock.position.floored()
  const botPosition = bot.entity.position.floored()

  if (blockPosition.y - botPosition.y > 5) {

    await bot.pathfinder.goto(
      new GoalNear(
        botPosition.x + 2,
        botPosition.y,
        botPosition.z + 2,
        1
      )
    )

  }

  if (blockPosition.x - botPosition.x > 5 || blockPosition.z - botPosition.z > 5) {

    await bot.pathfinder.goto(
      new GoalNear(
        nearestDirtBlock.position.x,
        botPosition.y,
        nearestDirtBlock.position.z,
        1
      )
    )

  }



  await bot.tool.equipForBlock(nearestDirtBlock)

  await bot.dig(nearestDirtBlock)

  // let isDirtDigged = false

  // const timeout = setTimeout(
  //   async () => {
  //     if (!isDirtDigged) {
  //
  //       console.log("TIMEOUT IS SETTED")
  //
  //       const mcData = require("minecraft-data")(bot.version);
  //
  //       const nearestBlock = await bot.findBlock({
  //         matching: mcData.blocksByName[log_type].id,
  //         maxDistance: 256,
  //       })
  //
  //       isDirtDigged = true
  //
  //       mineDirt(bot)
  //
  //       return
  //     }
  //   },
  //   10000
  // )

  mineDirt(bot)
}

async function searchLoot(bot) {

  console.log("searchLoot")

  const entities = bot.entities
  const itemsOnGround = Object.values(entities).filter(entity => entity.name === "item")

  // await bot.autoEat.eat()
  await bot.autoEat.disable()

  for (const item of itemsOnGround) {
    console.log(`start ${item.name}`, new Date())

    const {x, y, z} = item.position

    const botPosition = bot.entity.position.floored()
    if(y !== botPosition.y) return

    await bot.pathfinder.goto(
      new GoalNear(
        x,
        y,
        z,
        1
      )
    )

    console.log("end item", new Date())
  }

  await bot.autoEat.enable()

  await bot.waitForTicks(20)

  // currentCount++

  // startLumber(bot)

}


async function handleFullInventory (bot) {
  // async function handleFullInventory (bot: mineflayer.Bot) {
  //21040 81 -13477
  console.log("start handleFullInventory")
  const mcData = require('minecraft-data')(bot.version)
  
  console.log("handleFullInventory || => new GoalNear(20917, 70, -13484, 1)")
  await bot.pathfinder.goto(new GoalNear(20917, 70, -13484, 1))
  
  console.log("handleFullInventory || => find craftingTable")
  
  const wheatChest = await bot.findBlock({
    matching: mcData.blocksByName["chest"].id,
    maxDistance: 10,
  })
  
  const chestWindow = await bot.openBlock(wheatChest)
  
  let items = bot.inventory.items(
    el => el.name === 'dirt'
  )
  
  // ignore list to deposit items
  const ignoreList = [
    'wheat_seeds'
  ]
  
  for (const item of items) {
      console.log(item)
      if ( ignoreList.includes(item.name)) continue
  
      try {
          await chestWindow.deposit(item.type, null, item.count)    
      } catch (error) {
          console.log('Error handling while deposit items', error)
      }
  }
  
  await chestWindow.close()
  
  mineDirt(bot)

}

module.exports = {
  initDirtFarmer,
}
