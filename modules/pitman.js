//  extends Slave
// import Slave from "../classes/Slave";
// import { Bot } from "mineflayer";
const Slave = require("../classes/Slave")
const {USERS_WHITELIST} = require("../botConfig");
const { pathfinder, Movements, goals, GoalPlaceBlock } = require('mineflayer-pathfinder')
const {Vec3} = require("vec3");
const GoalNear = goals.GoalNear

const SECTION_LENGTH = 1
const Z_OFFSET = 0
const HEIGHT = 5
let keepMining = true
let currentMiningPosition

const BLACK_LIST = [
  'lava',
  'water',
]

const TRIGGER_BLOCKS_LIST = [
  'lava',
  'water',
  'air',
]

const GRAVITY_BLOCKS = [
  'sand',
  'red_sand',
  'gravel',
]

class PitMan extends Slave {

  /**
   * @type { mineflayer.Bot }
   */
  bot

  mcData

  /**
   *
   * @param { mineflayer.Bot } bot
   */
  constructor(bot) {
    super()

    this.bot = bot
    this.mcData = require("minecraft-data")(this.bot.version)
  }

  async initBot() {

    this.botLog(`initBot`)

    await this.initCommands()

  }

  async initCommands() {

    this.botLog(`initCommands`)

    this.bot.on("chat", async (username, message) => {

      if (!USERS_WHITELIST.includes(username)) return;

      message = message.replace(/^Я\] /, "");

      switch (message) {
        case "stop":
          keepMining = false
          break;
      }
    });

    this.startMine()

  }

  async startMine() {

    this.botLog(`Start mine`)

    currentMiningPosition = this.bot.entity.position.floored()

    await this.mineSection()

    this.botLog(`Finish mine`)

  }


  async mineSection() {

    this.botLog(`Start mineSection`)

    for (let sectionNum = 1; sectionNum <= SECTION_LENGTH; sectionNum++) {

      this.botLog(`Start mining section №${sectionNum}`)

      this.botLog(`Start checking is section №${sectionNum} clear`)

      let isSectionClear = await this.isColumnMined(sectionNum)

      if(isSectionClear) {

        continue

      }

      await this.mineColumn(sectionNum)

      this.botLog(`Start checking is section №${sectionNum} clear`)

      await this.bot.waitForTicks(10)

      isSectionClear = await this.isColumnMined(sectionNum)

      if(!isSectionClear) {

        this.botLog(`Section ${this.bot.entity.position.offset(sectionNum, 0, 0)} is not clear`)

        sectionNum--

      }

    }


    if (keepMining) {

      this.botLog(`keepMining`)

      const { x, y, z } = this.bot.entity.position.floored().offset(SECTION_LENGTH, 0, 0)

      await this.bot.pathfinder.goto(
        new GoalNear(
          x,
          y,
          z,
          1
        )
      )

      currentMiningPosition = this.bot.entity.position.floored()

      this.botLog(`Going to mineSection`)

      this.mineSection()

    }

  }

  async mineColumn(offsetX) {

    for (let currentY = HEIGHT-1; currentY >= 0; currentY--) {

      const botPosition = this.bot.entity.position.floored()

      const currentBlock = await this.bot.blockAt(botPosition.offset(offsetX, currentY, Z_OFFSET))

      if ( !currentBlock ) {
        this.botLog('No available block')
      }

      if (GRAVITY_BLOCKS.includes(currentBlock.name)) {

        currentY++

      }

      await this.mineBlock(currentBlock)

      await this.checkBotStatus()

    }

  }

  async mineBlock(block) {
    //
    // const validation = await this.checkBlock(block)
    //
    // if(!validation) {
    //
    //   this.botLog(`Something wrong with block`)
    //
    // }

    const isToolEquipped = await this.equipTool(block)

    if(!isToolEquipped) {

      this.botLog(`Failed to equip tool`)

    }

    const isBlockDestroyed = await this.destroyBlock(block)

    if(!isBlockDestroyed) {

      this.botLog(`Failed to destroy block`)

    }

    const isAroundSafe = await this.checkAroundBlocks(block)

    if(!isAroundSafe) {

      this.botLog(`Something wrong with around blocks`)

    }

  }


  async equipTool (block) {

    await this.bot.tool.equipForBlock(block, {})

    // Check is tool equipped

    return true

  }

  async destroyBlock(block) {

    if (block.name === 'water') {

      await this.replaceTriggerBlocks(block)

      return true
    }

    await this.bot.dig(block)

    // check is Block digged

    return true
  }

  async checkAroundBlocks(currentBlock) {

    this.botLog('Start checkAroundBlocks')

    const blockPosition = currentBlock.position.floored()
    this.botLog(`Current check around on ${blockPosition}`)

    const botPosition = this.bot.entity.position.floored()

    this.botLog('blockLeft')
    const blockLeft = this.bot.blockAt(blockPosition.offset(0, 0, -1))
    await this.replaceTriggerBlocks(blockLeft)

    this.botLog('blockRight')
    const blockRight = this.bot.blockAt(blockPosition.offset(0, 0, 1))
    await this.replaceTriggerBlocks(blockRight)

    this.botLog('blockBehind')
    const blockBehind = this.bot.blockAt(blockPosition.offset(1, 0, 0))
    await this.replaceTriggerBlocks(blockBehind)

    if ( blockPosition.y === botPosition.y + HEIGHT - 1 ) {
      this.botLog('blockTop')
      const blockTop = this.bot.blockAt(blockPosition.offset(0, 1, 0))
      console.log('blockTop', blockTop.position.y)
      await this.replaceTriggerBlocks(blockTop)
    }

    if ( blockPosition.y === botPosition.y ) {
      this.botLog('blockBottom')
      const blockBottom = this.bot.blockAt(blockPosition.offset(0, -1, 0))
      console.log('blockBottom', blockBottom.position.y)
      await this.replaceTriggerBlocks(blockBottom)
    }


    return true
  }


  async replaceTriggerBlocks(block) {

    this.botLog(`Start replaceTriggerBlocks`)

    let isReplaceFinish = false

    const replaceTimout = setTimeout(() => {
      if(!isReplaceFinish) {

        this.botLog('Start replaceTimout execution')

        this.checkBotStatus()

        this.replaceTriggerBlocks(block)
      }
    }, 5000)

    if (TRIGGER_BLOCKS_LIST.includes(block.name)) {

      this.botLog(`found trigger block on ${block.position}`)

      await this.bot.waitForTicks(1)

      if (!this.bot.heldItem || this.bot.heldItem.name !== 'cobblestone') {

        this.botLog('Start searching cobblestone')

        const cobbleStone = this.bot.inventory.findInventoryItem(this.mcData.itemsByName['cobblestone'].id, null, null)

        if(!cobbleStone) {
          this.botLog('Lack of CobbleStone')
        }

        this.botLog('Start eqp cobblestone')

        this.bot.inventory.requiresConfirmation = false

        await this.bot.equip(cobbleStone, "hand")

      }

      this.botLog('Searching referenceBlock')

      // const referenceBlock = await this.bot.blockAt(block.position.offset(-1, 0, 0))

      this.botLog('Placing block')

      this.bot.placeBlock(block, new Vec3(1, 0, 0))

      await this.bot.waitForTicks(1)

    }

    this.botLog(`End replaceTriggerBlocks`)

    isReplaceFinish = true

    return true

  }


  async checkBotStatus() {

    const botPosition = this.bot.entity.position.floored()
    const botLowerBlock = this.bot.blockAt(botPosition)
    const botUpperBlock = this.bot.blockAt(botPosition.offset(0, 1, 0))

    const allowed_blocks = ['air', 'water']

    if(!allowed_blocks.includes(botUpperBlock.name)) {

      this.botLog('!allowed_blocks.includes(botUpperBlock.name)')

      await this.equipTool(botUpperBlock)

      await this.destroyBlock(botUpperBlock)

      this.checkBotStatus()

      return

    }

    if(!allowed_blocks.includes(botLowerBlock.name)) {

      this.botLog('!allowed_blocks.includes(botLowerBlock.name)')

      await this.equipTool(botLowerBlock)

      await this.destroyBlock(botLowerBlock)

      this.checkBotStatus()

      return

    }

    const isPositionCorrect = botPosition.x === currentMiningPosition.x && botPosition.z === currentMiningPosition.z && botPosition.y === currentMiningPosition.y

    if (!isPositionCorrect) {
      await this.bot.pathfinder.goto(
        new GoalNear(
          currentMiningPosition.x,
          currentMiningPosition.y,
          currentMiningPosition.z,
          1
        )
      )
    }

  }


  async isColumnMined (offsetX) {

    this.botLog('Start isColumnMined')

    for (let currentY = 0; currentY < HEIGHT; currentY++) {

      this.botLog(`Checking block ${currentY}`)

      const botPosition = this.bot.entity.position.floored()

      const currentBlock = await this.bot.blockAt(botPosition.offset(offsetX, currentY, Z_OFFSET))

      console.log(currentBlock.name)

      if ( !currentBlock ) {
        this.botLog('No available block')
      }

      if ( currentBlock.name !== 'air' ) {

        this.botLog('Column is not clear')

        return false
      }

    }

    return true

  }


  botLog(log) {

    console.log(`PitMan: ${this.bot.username} || ${log}`)

  }


}

async function startPitMan(bot) {

  const pitMan = new PitMan(bot)

  await pitMan.initBot()

}

module.exports = {

  startPitMan,

}
