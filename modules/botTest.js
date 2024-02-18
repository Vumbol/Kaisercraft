const {Vec3} = require('vec3')
const {USERS_WHITELIST} = require("../botConfig");

module.exports = async function botTest(bot) {

  bot.on("chat", async (username, message) => {

    if (!USERS_WHITELIST.includes(username)) return;

    message = message.replace(/^Я\] /, "");

    switch (message) {
      case "soreitems":
        storeItems(bot)
        break;
    }
  });


  const mcData = require("minecraft-data")(bot.version)

  // const block = bot.blockAt({x: 73, y: 71, z: 23})
  const block = bot.blockAt(new Vec3(73, 71, 23))

  const rod = bot.inventory.findInventoryItem(mcData.itemsByName['fishing_rod'].id, null, null)

  await bot.equip(rod, "hand")
  //
  // bot.equip(rod, 'hand', function(err){
  //   if(err) throw err;
  // });

  while(true) {

    if (!bot.heldItem || bot.heldItem.name !== 'fishing_rod') {

      const rod = bot.inventory.findInventoryItem(mcData.itemsByName['fishing_rod'].id, null, null)

      await bot.equip(rod, "hand")

    }

    await bot.fish()

  }

}

async function storeItems(bot) {
  const mcData = require("minecraft-data")(bot.version)

  const chest = await bot.findBlock({
    matching: mcData.blocksByName["trapped_chest"].id,
    maxDistance: 5,
  })

  const chestWindow = await bot.openBlock(chest)

  let items = bot.inventory.items()

// ignore list to deposit items
  const ignoreList = [
    // 'fishing_rod'
  ]

  for (const item of items) {
    if ( ignoreList.includes(item.name)) continue

    try {
      await chestWindow.deposit(item.type, null, item.count)
    } catch (e) {

    }
  }

  await chestWindow.close()
}
