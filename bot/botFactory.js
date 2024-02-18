/**
 * Нужен для создания инстансов ботов
 */
const mineflayer = require("mineflayer");
const {pathfinder} = require("mineflayer-pathfinder");
const {plugin: toolPlugin} = require("mineflayer-tool");
const {politMineAuth} = require("../utils/politMine.auth");
const {initCommands} = require("../modules/commands");
const {plugin: autoeat} = require("mineflayer-auto-eat");
const {BotWrapper} = require("./botWrapper");
const { mapDownloader } = require('mineflayer-item-map-downloader')

const fs = require('fs');
const Jimp = require('jimp');

const directory = './assets/';
const outputFile = './output/combined.png';


class BotFactory {

  /**
   * @description Тут планирую подключать все нужные либы, сервисы и т.д.
   *
   * @param { Object } botConfig
   * @return {Promise<Bot>}
   */
  static async createBot(botConfig) {

    botConfig["mapDownloader-outputDir"] = "./assets/"

    const bot = await mineflayer.createBot(botConfig)

    bot.loadPlugin(pathfinder)
    bot.loadPlugin(toolPlugin)
    bot.loadPlugin(autoeat)

//     bot.on('login', () => {
//       setTimeout(() => {
//         bot.loadPlugin(mapDownloader)
//       }, 2000)
//     })
//
//     let isMapChecking = 0
//
//     bot.on('new_map_saved', () => {
//
//       if(isMapChecking === 0) {
//         isMapChecking = 1
//
//         setTimeout(() => {
// // Читаем содержимое папки
//           fs.readdir(directory, (err, files) => {
//             if (err) {
//               console.error('Could not list the directory.', err);
//               process.exit(1);
//             }
//
//             // Отфильтровываем только файлы с нужными названиями
//             const imageFiles = files.filter(file => file.startsWith('map_00000') && file.endsWith('.png'));
//
//             // Сортируем файлы по номеру
//             imageFiles.sort((a, b) => {
//               const indexA = parseInt(a.substring(8, a.lastIndexOf('.png')), 10);
//               const indexB = parseInt(b.substring(8, b.lastIndexOf('.png')), 10);
//               return indexA - indexB;
//             });
//
//             // Создаем массив с промисами чтения изображений
//             const imagePromises = imageFiles.map(imageFile => Jimp.read(directory + imageFile));
//
//             // Ждем загрузки всех изображений
//             Promise.all(imagePromises)
//               .then(images => {
//                 // Находим ширину и высоту одного изображения
//                 const imageWidth = images[0].getWidth();
//                 const imageHeight = images[0].getHeight();
//
//                 // Вычисляем количество изображений в каждой строке и столбце
//                 const n = Math.sqrt(images.length);
//                 const rows = Math.ceil(images.length / n);
//                 const cols = Math.ceil(images.length / rows);
//
//                 // Создаем новое изображение, куда будем склеивать другие изображения
//                 return new Jimp(imageWidth * cols, imageHeight * rows, (err, combinedImage) => {
//                   if (err) throw err;
//
//                   // Добавляем изображения построчно
//                   for (let i = 0; i < rows; i++) {
//                     for (let j = 0; j < cols; j++) {
//                       const index = i * cols + j;
//                       if (index < images.length) {
//                         combinedImage.composite(images[index], j * imageWidth, i * imageHeight);
//                       }
//                     }
//                   }
//
//                   // Сохраняем объединенное изображение
//                   combinedImage.write(outputFile, (err) => {
//                     if (err) throw err;
//                     console.log('Images combined successfully!');
//                   });
//                 });
//               })
//               .catch(err => {
//                 console.error('Error processing images:', err);
//               });
//           });
//
//           const readline = require('node:readline').createInterface({
//             input: process.stdin,
//             output: process.stdout,
//           });
//           readline.question(`What is answer`, answer => {
//
//             bot.chat(answer)
//
//             setTimeout(() => {
//               bot.chat('/login kelpo1234')
//             }, 2000)
//
//             readline.close();
//           });
//
//         }, 3000)
//       }
//
//     })

    // Вынести в опции
    politMineAuth(bot)

    initCommands(bot)


    bot.on('kicked', (err) => {
      // initBot()
      console.log(err)
    })
    bot.on('error', (err) => {
      // initBot()
      console.log(err)
    })

    return bot

  }

}

module.exports = BotFactory
