/**
 * @description Метод нужен для обработки событий, который могут залагать или выполняться дольше обычного,
 * если метод\функция action выполняется дольше timeoutInSeconds секунд, то оно прекратится и вызовется callback
 * 
 * @param {Function} action 
 * @param {Number} timeoutInSeconds 
 * @param {Function} callback 
 */

async function tryAction(action, timeoutInSeconds, callback) {

    // Суть работы: создаём промис, если он выполнится, то прокинет ошибку, если функция action отработает - очищаем таймаут
    let timeout
  
    const timeoutPromise = new Promise((_, reject) => {
      timeout = setTimeout(() => {
        clearTimeout(timeout)

        reject(new Error(`Функция не завершилась за ${timeoutInSeconds} секунд`));
      }, timeoutInSeconds * 1000)

    })
  
    try {
      // Вызываем асинхронную функцию func1
      await Promise.race([action(), timeoutPromise]);
      // Если func1 завершилась до таймаута, очищаем таймер
      clearTimeout(timeout);
    } catch (error) {
      console.log("Action failed")
      // Если возникла ошибка (таймаут), вызываем колбэк
      callback(error)
    }
  }
  
  /**
   * Пример использования:
   * 
  async function exampleAsyncFunction() {
    // Симулируем асинхронную функцию, которая выполняется долго
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log("Функция завершена");
  }
  
  const timeoutInSeconds = 3;
  
  tryAction(exampleAsyncFunction, timeoutInSeconds, (error) => {
    console.error(error.message); // Выводим сообщение об ошибке в случае таймаута
  })

*/

module.exports = {
  tryAction,
}