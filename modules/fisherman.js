const Slave = require("../classes/Slave");
const {USERS_WHITELIST} = require("../botConfig");
const {Vec3} = require("vec3");
const { goals } = require('mineflayer-pathfinder')
const GoalNear = goals.GoalNear

let keepWorking = true

const ANTI_TP_ANSWERS = ["/lc э", "/lc Чо", "/lc xj", "/lc Че", "/lc чё блять", "/lc Блять", "/lc Что?", "/lc Что", "/lc А", "/lc М", "/lc ?", "/lc ээ", "/lc Xnj"]

class FisherMan extends Slave {

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
    super(bot)

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
        case "fish on":
          keepWorking = true
          this.startFish()
          break;
        case "fishstop":
          keepWorking = false
          break;
        case "fishstoreitems":
          keepWorking = false
          this.handleFullInventory()
          break;
        case "sethome":
          this.saveHome();
          break;
      }
    });

    // this.startFish()

  }

  async startFish () {

    let context = {}
    context.isBotTexting = false

    const {x: hx, y: hy, z: hz, yaw: hyaw, pitch: hpitch} = this.getHome()

    this.hyaw = hyaw
    this.hpitch = hpitch

    if(!hx || !hy || !hz) {
      return
    }

    while (keepWorking) {

      const {x: bx, y: by, z: bz} = this.bot.entity.position.floored()

      if ( hx !== bx || by !== hy || bz !== hz ) {

        let randomIndex = Math.floor(Math.random() * ANTI_TP_ANSWERS.length)

        let randomTimeout = Math.floor(Math.random() * (100 - 40 + 1)) + 40

        this.messageWithTimeout(this.bot, ANTI_TP_ANSWERS[randomIndex], randomTimeout, context)

        await this.bot.waitForTicks(randomTimeout+10)

        this.bot.pathfinder.setGoal(new GoalNear(hx, hy, hz, 0))

        await this.bot.waitForTicks(80)

        continue

      }

      if (!this.bot.heldItem || this.bot.heldItem.name !== 'fishing_rod') {

        const rod = this.bot.inventory.findInventoryItem(this.mcData.itemsByName['fishing_rod'].id, null, null)

        await this.bot.equip(rod, "hand")

      }

      if (this.bot.inventory.emptySlotCount() === 0 ) {

        await this.handleFullInventory()

      }

      await this.bot.look(this.hyaw, this.hpitch)

      await this.bot.fish()

    }

  }


  async handleFullInventory () {

    const chest = await this.bot.findBlock({
      matching: this.mcData.blocksByName["trapped_chest"].id,
      maxDistance: 5,
    })

    const chestWindow = await this.bot.openBlock(chest)

    let items = this.bot.inventory.items()

    // ignore list to deposit items
    const ignoreList = [
      'fishing_rod'
    ]

    for (const item of items) {
      if ( ignoreList.includes(item.name)) continue

      try {
        await chestWindow.deposit(item.type, null, item.count)
      } catch (e) {
        this.botLog('Error while chestWindow')
      }
    }

    await chestWindow.close()

    // await this.bot.lookAt(new Vec3(0, 0, -1))
    // await this.bot.look(Math.PI/18, 0)
    await this.bot.look(this.hyaw, this.hpitch)
  }

  async messageWithTimeout (bot, message, timeout, context) {

    await bot.waitForTicks(timeout)

    await bot.chat(message)

    context.isBotTexting = false

  }

  botLog(log) {

    console.log(`FisherMan: ${this.bot.username} || ${log}`)

  }


}

async function startFisherMan(bot) {

  const fisherMan = new FisherMan(bot)

  await fisherMan.initBot()

}

module.exports = {

  startFisherMan,

}
