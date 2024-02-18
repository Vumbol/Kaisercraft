// Создаём бота по клику на кнопку
document.getElementById('createBot').addEventListener('click', function() {
  var inputText = document.getElementById('nickName').value

  fetch(`http://localhost:3333/api/bot/loginBot/${inputText}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log('Response from server:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    })
})

// Отключаем бота по клику на кнопку
document.getElementById('stopBot').addEventListener('click', function() {
  var inputText = document.getElementById('nickName').value

  fetch(`http://localhost:3333/api/bot/stopBot/${inputText}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log('Response from server:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    })
})
