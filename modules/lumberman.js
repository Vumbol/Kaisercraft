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
  console.log(`${bot.username} || initLumberman`)

  let type = "birch"

  try {


    const messageMatch = message.match(/hui lesorub "(.*?)"/)

    console.log("MESSAGE", message, messageMatch)

    type = messageMatch[1]


} catch (error) {

    bot.chat(`/msg ${username} Шёл бы ты нахуй`) 

}

  console.log(type)

  bot.loadPlugin(pathfinder);
  bot.loadPlugin(toolPlugin);
  bot.loadPlugin(autoeat);

  log_type = `${type}_log`
  sapling_type = `${type}_sapling`

  bot.on("autoeat_started", (item, offhand) => {
    console.log(`Eating ${item.name} in ${offhand ? "offhand" : "hand"}`);
  })

  const botService = new BotService(bot)

  botService.chooseJob(16)

  initLumbermanCommands(bot, botService)
}


function initLumbermanCommands(bot, botService) {
  console.log("initLumbermanCommands")

  bot.on("chat", async (username, message) => {
    console.log(username, message);

    if (!USERS_WHITELIST.includes(username)) return;

    message = message.replace(/^Я\] /, "");

    console.log(username, message);

    switch (message) {
      case "rubi":
        startLumber(bot);
        break;
      case "sopli":
        searchLoot(bot);
        break;
      case "clj":
        botService.chooseJob(16);
        break;
    }
  });
}

let currentCount = 0


async function startLumber(bot) {
  console.log(`${bot.username} || start Lumber Process`)

  bot.inventory.requiresConfirmation = false

  await searchLoot(bot)

  const mcData = require("minecraft-data")(bot.version);

  const isSapling = await bot.inventory.findInventoryItem(
    mcData.itemsByName[sapling_type].id,
    null
  )

  if(!isSapling) {

    await waitNewTrees(bot)
    return
  }

  const nearestBlock = await bot.findBlock({
    matching: mcData.blocksByName[log_type].id,
    maxDistance: 256,
  })


  if(!nearestBlock) {

    await bot.autoEat.eat()

    await bot.waitForTicks(20)

    waitNewTrees(bot)
    return

  }

  const blockPosition = nearestBlock.position.floored()
  const botPosition = bot.entity.position.floored()

  if(blockPosition.x - botPosition.x > 30){

    console.log('blockPosition.x - botPosition.x > 30', blockPosition.x - botPosition.x)

    waitNewTrees(bot)
    return

  }

  console.log(blockPosition, botPosition)

  if(blockPosition.y !== botPosition.y) {
    // waitNewTrees(bot)

    await lumberNotFullTree(bot, nearestBlock)

    return
  }
  
  await bot.pathfinder.goto(
    new GoalNear(
      nearestBlock.position.x,
      nearestBlock.position.y,
      nearestBlock.position.z,
      1
    )
  )


  let currentBlock = nearestBlock


  async function getNearestDirtBlock(block) {
    currentBlock = await bot.blockAt(block.position.offset(0, -1, 0))

    if (currentBlock.name === "dirt") {
      return
    }
    
    await getNearestDirtBlock(currentBlock)
  }

  await getNearestDirtBlock(currentBlock)

  await bot.setControlState('sneak', true)

  // await bot.tool.equipForBlock(bot.blockAt(currentBlock.position.offset(0, 1, 0)))

  console.log(`${bot.username} || eqp tool start`)

  let tool = await bot.inventory.findInventoryItem(mcData.itemsByName["diamond_axe"].id, null)


  if(!tool) {

    console.log(`${bot.username} || eqp tool failed`)

  } else {

    await bot.equip(
      tool,
      "hand"
    )

  }


  console.log(`${bot.username} || eqp tool end`)

  await bot.dig(bot.blockAt(currentBlock.position.offset(0, 1, 0)))

  const dirtBlock = await bot.blockAt(currentBlock.position)

  console.log("sapling start")

  const saplingSlot =     bot.inventory.findInventoryItem(
    mcData.itemsByName[sapling_type].id,
    null
  )

  if(!saplingSlot) {

    console.log(`${bot.username} || OUT OF SAPLINGS`)

  }
  else {
    await bot.equip(
      saplingSlot,
      "hand"
    )
  }

  console.log("sapling end")


  await bot.placeBlock(dirtBlock, new Vec3(0, 1, 0))

  const expectedSapling = await bot.blockAt(dirtBlock.position.offset(0, 1, 0))


  currentBlock = await bot.blockAt(dirtBlock.position.offset(0, 1, 0))

  console.log(`${bot.username} || eqp tool start`)

  tool = bot.inventory.findInventoryItem(mcData.itemsByName["diamond_axe"].id, null)


  if(!tool) {

    console.log(`${bot.username} || eqp tool failed`)

  } else {

    await bot.equip(
      tool,
      "hand"
    )

  }


  console.log(`${bot.username} || eqp tool end`)

  let isTreeDigged = false

  const timeout = setTimeout(
    async () => {
      if (!isTreeDigged) {

        console.log("TIMEOUT IS SETTED")

        const mcData = require("minecraft-data")(bot.version);

        const nearestBlock = await bot.findBlock({
          matching: mcData.blocksByName[log_type].id,
          maxDistance: 256,
        })
      

        await digTree(nearestBlock)

        await bot.setControlState('sneak', false)

        isTreeDigged = true
      
        startLumber(bot)

        return
      }
    },
    30000
  )

  async function digTree(block) {

    console.log("step 1")

    const blockPosition = await block.position.offset(0, 1, 0)
    currentBlock = await bot.blockAt(blockPosition)

    if ( currentBlock.name !== log_type ) {
      return
    }
  
    console.log("step 3")

    await bot.dig(currentBlock)

    console.log("step 4")

    await digTree(currentBlock)
  
  }

  await bot.waitForTicks(5)

  await digTree(currentBlock)

  await bot.setControlState('sneak', false)

  isTreeDigged = true

  console.log(expectedSapling)

  if (expectedSapling.name !== sapling_type) {

    await bot.placeBlock(dirtBlock, new Vec3(0, 1, 0))

  }

  startLumber(bot)
}

async function searchLoot(bot) {

  console.log("searchLoot")

  const mcData = require("minecraft-data")(bot.version);

  const entities = bot.entities
  const itemsOnGround = Object.values(entities).filter(entity => {
    if (entity.name !== "item") return

    const itemId = entity.metadata[7].itemId

    return itemId === 25
  })


  // const itemName = mcData.items[entity.metadata[7].itemId]

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

async function waitNewTrees(bot) {

  await bot.waitForTicks(40)

  console.log("waitNewTrees => searchLoot")

  await searchLoot(bot)

  await bot.waitForTicks(40)

  console.log("waitNewTrees => startLumber")

  await startLumber(bot)

}


async function lumberNotFullTree(bot, nearestBlock) {

  const mcData = require("minecraft-data")(bot.version)

  await bot.pathfinder.goto(
    new GoalNear(
      nearestBlock.position.x,
      bot.position.y,
      nearestBlock.position.z,
      1
    )
  )


  let currentBlock = nearestBlock

  console.log(`${bot.username} || eqp tool start`)

  const tool =     bot.inventory.findInventoryItem(mcData.itemsByName["diamond_axe"].id, null)


  if(!tool) {

    console.log(`${bot.username} || eqp tool failed`)

  } else {

    await bot.equip(
      tool,
      "hand"
    )

  }


  console.log(`${bot.username} || eqp tool end`)

  await bot.setControlState('sneak', true)

  await bot.dig(currentBlock)

  // await bot.waitForTicks(5)

  // Можно ещё реализовать проверку и в случае чего засаживать саженец


  let isTreeDigged = false

  const timeout = setTimeout(
    async () => {
      if (!isTreeDigged) {

        console.log("TIMEOUT IS SETTED")

        const nearestBlock = await bot.findBlock({
          matching: mcData.blocksByName[log_type].id,
          maxDistance: 256,
        })


        await digTree(nearestBlock)

        await bot.setControlState('sneak', false)

        isTreeDigged = true

        startLumber(bot)

        return
      }
    },
    30000
  )

  async function digTree(block) {

    const blockPosition = await block.position.offset(0, 1, 0)
    currentBlock = await bot.blockAt(blockPosition)

    if ( currentBlock.name !== log_type ) {
      return
    }

    await bot.dig(currentBlock)

    await digTree(currentBlock)

  }

  await bot.waitForTicks(5)

  await digTree(currentBlock)

  await bot.setControlState('sneak', false)

  isTreeDigged = true

  startLumber(bot)

}

async function equipAndLookBlock(bot, block) {
  await bot.tool.equipForBlock(bot.blockAt(block, {}, (err) => {
    console.log(err)
    console.log("Stop equip")
  }));
}

module.exports = {
  initLumberman,
};
