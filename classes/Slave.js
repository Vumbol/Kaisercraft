const fs = require('fs');
const path = require('path');

module.exports = class Slave {

  dataDirectory = './data/';

  constructor(bot) {

    this.bot = bot
  }

  saveHome() {

    this.saveData(this.bot.username, { home: {...this.bot.entity.position.floored(), yaw: this.bot.entity.yaw, pitch: this.bot.entity.pitch} })

  }

  getHome() {

    return this.readFromFile(this.bot.username).home

  }

  saveData(filename, data) {
    const filepath = path.join(this.dataDirectory, filename + '.json');
    const jsonData = JSON.stringify(data, null, 2); // Форматированный JSON с отступами в 2 пробела
    fs.writeFileSync(filepath, jsonData);
    console.log(`Файл ${filename}.json успешно сохранен.`);
  }

  readFromFile(filename) {

    const filepath = path.join(this.dataDirectory, filename + '.json');
    if (!fs.existsSync(filepath)) {
      console.error(`Файл ${filename}.json не существует.`);
      return null;
    }
    const jsonData = fs.readFileSync(filepath, 'utf-8');
    try {
      const data = JSON.parse(jsonData);
      console.log(`Файл ${filename}.json успешно прочитан.`);
      return data;
    } catch (error) {
      console.error(`Ошибка при чтении файла ${filename}.json:`, error);
      return null;
    }

  }

}
