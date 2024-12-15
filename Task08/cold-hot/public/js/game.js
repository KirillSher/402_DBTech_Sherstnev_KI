document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const guessBtn = document.getElementById('guess-btn');
    const viewGamesBtn = document.getElementById('view-games');
    const playerNameInput = document.getElementById('player-name');
    const guessInput = document.getElementById('guess');
    const hintsDiv = document.getElementById('hints');
    const gameArea = document.getElementById('game-area');
    const closeGamesBtn = document.getElementById('close-games');
    const clearDbBtn = document.getElementById('clear-db-btn');
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeBtn = document.querySelector('.close');

    let secretNumber;
    let attempts = [];
    let gameId;

    helpBtn.onclick = function() {
        helpModal.style.display = 'block';
    }

    closeBtn.onclick = function() {
        helpModal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
    }

    startBtn.addEventListener('click', async () => {
        const playerName = playerNameInput.value.trim();
        if (playerName === '') {
            alert('Введите ваше имя!');
            return;
        }
        secretNumber = generateUniqueNumber();
        attempts = [];
        gameArea.style.display = 'block';
        hintsDiv.innerHTML = '';
        const response = await fetch('/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerName,
                secretNumber,
                result: 'В процессе',
                date: new Date().toISOString()
            })
        });
        const result = await response.json();
        gameId = result.id;
    });

    guessBtn.addEventListener('click', async () => {
        const guess = guessInput.value.trim();
        if (!isValidGuess(guess)) {
            alert('Введите правильное число от 1 до 100!');
            return;
        }
        
        const hint = getHint(secretNumber, guess);
        attempts.push({ guess, hint });
    
        hintsDiv.innerHTML += `<p>${attempts.length}. Предположение: ${guess} - ${hint}</p>`;
        
        await fetch('/attempts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gameId,
                attemptNumber: attempts.length,
                guess,
                hint
            })
        });
        
        guessInput.value = '';

        if (hint.includes('Поздравляем!')) {
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Закрыть';
            closeButton.onclick = () => {
                gameArea.style.display = 'none';
                hintsDiv.innerHTML = ''; // Очистить подсказки
            };
            hintsDiv.appendChild(closeButton);

            alert('Поздравляем! Вы угадали число!');
            
            // Обновляем статус игры в базе данных
            await fetch(`/games/${gameId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    result: 'Победа' // Указываем статус победы
                })
            });
        }
    });

    async function viewGameAttempts(gameId) {
        const response = await fetch(`/games/${gameId}`); // Изменили URL для запроса
        if (!response.ok) {
            console.error('Ошибка при получении данных об игре:', response.statusText);
            return;
        }
    
        const gameData = await response.json();
        const attemptsList = document.getElementById('attempts-list');

        document.getElementById('history-moves-text').style.display = 'block';
        attemptsList.innerHTML = '';
    
        // Перебираем попытки и добавляем их в список
        gameData.attempts.forEach(attempt => {
            const listItem = document.createElement('li');
            listItem.textContent = `Попытка ${attempt.attemptNumber}: ${attempt.guess} - ${attempt.hint}`;
            attemptsList.appendChild(listItem);
        });
    } 

    viewGamesBtn.addEventListener('click', async () => {
        await updateGameList(); // Обновляем список игр
    });
    
    async function updateGameList() {
        const response = await fetch('/games');
        const games = await response.json();
        const gameList = document.getElementById('game-list');
        gameList.innerHTML = '';
        const emptyMessageDiv = document.getElementById('empty-message'); // Элемент для сообщения об отсутствии игр
        emptyMessageDiv.style.display = 'none'; // Скрываем сообщение об отсутствии игр

        if (games.length === 0) {
            emptyMessageDiv.textContent = 'Нет доступных игр.';
            emptyMessageDiv.style.display = 'block'; // Показываем сообщение, если игр нет
            emptyMessageDiv.style.paddingTop = '20px'; // Показываем сообщение, если игр нет
            document.getElementById('close-games').style.display = 'inline-flex'; // Скрываем кнопку закрытия
            return;
        }
    
        games.forEach(game => {
            const listItem = document.createElement('li');
            listItem.textContent = `${game.date} - Игрок: ${game.playerName}, Загаданное число: ${game.secretNumber}, Результат: ${game.result}`;
            listItem.onclick = () => {
                viewGameAttempts(game.id);
                document.getElementById('attempts-list').style.display = 'block';
            };
            gameList.appendChild(listItem);
        });
    
        document.getElementById('close-games').style.display = 'inline-flex'; // Показываем кнопку закрытия
    }

    closeGamesBtn.addEventListener('click', () => {
        document.getElementById('game-list').innerHTML = '';
        document.getElementById('attempts-list').style.display = 'none';
        document.getElementById('close-games').style.display = 'none';
        document.getElementById('empty-message').style.display = 'none';
        document.getElementById('history-moves-text').style.display = 'none';
    });

    clearDbBtn.addEventListener('click', async () => {
        const response = await fetch('/clear-db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
            alert('База данных успешно очищена.');
            updateGameList(); // Обновить список игр после очистки базы данных
        } else {
            alert('Не удалось очистить базу данных.');
        }        
    });

    function generateUniqueNumber() {
        const num = Math.floor(Math.random() * 100) + 1;
        console.log(num);
        return num.toString();
    }

    // Исправленная функция проверки ввода
    function isValidGuess(guess) {
        const num = Number(guess);
        return Number.isInteger(num) && num >= 1 && num <= 100; // Проверяем, что число целое и в диапазоне от 1 до 100.
    }

    function getHint(secret, guess) {
        const hints = [];

        if (guess === secret) {
            return 'Поздравляем! Вы угадали число!';
        } else {
            const difference = Math.abs(secret - guess);
            
            if (difference >= 20) {
                return 'Очень холодно';
            } else if (difference >= 10) {
                return 'Холодно';
            } else if (difference >= 5) {
                return 'Тепло';
            } else {
                return 'Очень горячо';
            }
        }
    
        return hints.sort().join(', ');
    }
});
