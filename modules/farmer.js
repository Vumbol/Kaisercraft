const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const GoalNear = goals.GoalNear;
const toolPlugin = require("mineflayer-tool").plugin;
const autoeat = require("mineflayer-auto-eat").plugin;
// const  blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer)
const Vec3 = require('vec3');
const { BotService } = require("../classes/BotService");

function initFarmer(bot) {
    console.log('initMinerBot')

    bot.loadPlugin(pathfinder)
    bot.loadPlugin(toolPlugin)
    bot.loadPlugin(autoeat)

    const botService = new BotService(bot)

    bot.on('autoeat_started', (item, offhand) => {
        console.log(`Eating ${item.name} in ${offhand ? 'offhand' : 'hand'}`)
    })

    initFarmerCommands(bot, botService)
}

function initFarmerCommands(bot, botService) {
    console.log("initLumbermanCommands")

    bot.inventory.requiresConfirmation = false

    bot.on("chat", async (username, message) => {

        console.log(username, message)


        if (username !== "Gambol_Veneno") return

        message = message.replace(/^Я\] /, '');

        console.log(username, message)

        switch (message) {
            case "отсоси": startFarmer(bot, botService); break;
            case "inv": handleFullInventory(bot, botService); break;
        }
    
    })
}

async function startFarmer(bot, botService) {

  console.log('start farmer')

  const isInventoryFull = await botService.isInventoryFull()

  // console.log(isInventoryFull)


  if(isInventoryFull) {
    handleFullInventory(bot, botService)
    return
  }

  // console.log(botService.isInventoryFull())

  const mcData = require('minecraft-data')(bot.version)


  const nearestBlock = await bot.findBlock({
    matching: (block) => {
        if (block.name === 'wheat' && block._properties?.age === 7) {
            return true
        }
    },
    maxDistance: 256,
  })

  console.log(nearestBlock)

  if(!nearestBlock) {
    console.log('no nearestBlock')

    await bot.pathfinder.goto(new GoalNear(21008, 81, -13456, 1))

    await bot.waitForTicks(40)

    startFarmer(bot, botService)
    return
  }

  const blockPosition = nearestBlock.position.floored()
  const botPosition = bot.entity.position.floored()

//   console.log(blockPosition, botPosition)
  await bot.pathfinder.goto(new GoalNear(nearestBlock.position.x, botPosition.y, nearestBlock.position.z, 1))

  const underBlock = await bot.blockAt(nearestBlock.position.offset(0, -1, 0))

//   await equipAndLookBlock(bot, nearestBlock)
//   await bot.tool.equipForBlock(nearestBlock)

  await bot.autoEat.disable()

  await bot.dig(nearestBlock)

  console.log("farmer debug || eqp")
  await bot.equip(bot.inventory.findInventoryItem(mcData.itemsByName['wheat_seeds'].id,null), "hand")

  console.log("farmer debug || placeBlock")
  await bot.placeBlock(underBlock, new Vec3(0, 1, 0))

  // TODO: 
  await bot.waitForTicks(5)

  await bot.autoEat.enable()

//   if(underBlock.name === 'dirt') {

//     await bot.equip(bot.inventory.findInventoryItem(mcData.itemsByName['birch_sapling'].id,null), "hand")

//     await bot.placeBlock(underBlock, new Vec3(0, 1, 0))

//   }

console.log("farmer debug || => startFarmer")
startFarmer(bot, botService)
}

async function handleFullInventory (bot, botService) {
// async function handleFullInventory (bot: mineflayer.Bot) {
//21040 81 -13477
console.log("start handleFullInventory")
const mcData = require('minecraft-data')(bot.version)

console.log("handleFullInventory || => new GoalNear(21013, 81, -13489, 1)")
await bot.pathfinder.goto(new GoalNear(21041, 81, -13480, 1))

console.log("handleFullInventory || => find craftingTable")

const wheatChest = await bot.findBlock({
  matching: mcData.blocksByName["trapped_chest"].id,
  maxDistance: 5,
})

const chestWindow = await bot.openBlock(wheatChest)

let items = bot.inventory.items()

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

const emeraldBlock = await bot.findBlock({
  matching: mcData.blocksByName["emerald_block"].id,
  maxDistance: 15,
})

const seedsChest = await bot.blockAt(emeraldBlock.position.offset(0, 1, 0))

const seedsChestWindow = await bot.openBlock(seedsChest)

items = bot.inventory.items(
  el => el.name === 'wheat_seeds'
)

let stackCounter = 0

for (const item of items) {

    stackCounter++

    if(stackCounter === items.length) continue

    console.log(item.name)
    // if ( ignoreList.includes()) continue

    try {
        await seedsChestWindow.deposit(item.type, null, item.count)    
    } catch (error) {
        console.log('Error handling while deposit items', error)
    }
}

await seedsChestWindow.close()

startFarmer(bot, botService)

// deposit seeds

// console.log(craftingTable)

// console.log(bot.inventory)

// const receipts = await bot.recipesAll(mcData.blocksByName["hay_block"].id, null, craftingTable.position)

// console.log(receipts[0])

// console.log(bot.inventory)

// const currentCraftingTable = await bot.blockAt(craftingTable.position)

// console.log(currentCraftingTable)
// bot.craft(receipts[0], null, currentCraftingTable)

// bot.inventory.requiresConfirmation = false

// bot.craft
// console.log(bot.inventory)

}

// async function equipAndLookBlock(bot, block) {
//     await bot.tool.equipForBlock(bot.blockAt(block, {}, () => { }))
// }

module.exports = {
    initFarmer,
}