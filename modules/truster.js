const Slave = require("../classes/Slave");
const {USERS_WHITELIST} = require("../botConfig");
const {Vec3} = require("vec3");

let keepWorking = true

class TrustMan extends Slave {

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
        case "trust":
          keepWorking = true
          this.startHarvest()
          break;
        case "tstop":
          keepWorking = false
          break;
        case "thi":
          keepWorking = false
          this.handleFullInventory()
          break;
      }
    });

    // this.startFish()

  }

  async startHarvest () {


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
    //
    // await this.bot.lookAt(new Vec3(0, 0, -1))
    // await this.bot.look(Math.PI/18, 0)

  }


  botLog(log) {

    console.log(`FisherMan: ${this.bot.username} || ${log}`)

  }


}

async function startTrustMan(bot) {

  const trustMan = new TrustMan(bot)

  await trustMan.initBot()

}

module.exports = {

  startTrustMan,

}
