function checkIsInventoryFull(bot) {
    console.log('checkIsInventoryFull')
    console.log(bot.inventory.emptySlotCount())
    return bot.inventory.emptySlotCount() === 0
}

module.exports = {
    checkIsInventoryFull
}