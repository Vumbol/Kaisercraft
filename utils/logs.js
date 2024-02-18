const fs = require('fs')

function showWorld(bot) {
    // try {
        console.log("CUUUUUUUUUNKS")
        console.log(bot.world.async.columns['1312,-844'])
        // fs.writeFile("world.txt", JSON.stringify(bot.world), { encoding: "utf-8", flag: "a" }, (err) => {
        //     if (err) {
        //         console.error("Error writing to file:", err);
        //     }
        // });
    // } catch (error) {
    //     console.log(error)
    // }

}

module.exports = {
    showWorld
}