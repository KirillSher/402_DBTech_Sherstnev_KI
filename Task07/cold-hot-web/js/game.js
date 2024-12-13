import { saveGame, getAllGames, clearDatabase, getGameById } from './db.js';

document.addEventListener('DOMContentLoaded', function () {
    const startBtn = document.getElementById('startBtn');
    const viewPastGamesBtn = document.getElementById('view-past-games');
    const clearDbBtn = document.getElementById('clear-db');
    const helpBtn = document.getElementById('help');
    const closeHelpBtn = document.getElementById('close-help');
    const closeGameBtn = document.getElementById('close-game');
    const closeGameListBtn = document.getElementById('close-game-list');

    let secretNumber;
    let attempts = [];
    let playerName;

    startBtn.addEventListener('click', startNewGame);
    viewPastGamesBtn.addEventListener('click', displayPastGames);
    clearDbBtn.addEventListener('click', async () => {
        await clearDatabase();
        alert('База данных очищена!');
        displayPastGames();
    });
    helpBtn.addEventListener('click', () => {
        document.getElementById('help-container').style.display = 'block';
    });
    closeHelpBtn.addEventListener('click', () => {
        document.getElementById('help-container').style.display = 'none';
    });
    closeGameBtn.addEventListener('click', () => {
            document.getElementById('game-container').style.display = 'none';
    });
    closeGameListBtn.addEventListener('click', () => {
        document.getElementById('close-game-list').style.display = 'none';
        document.getElementById('game-list').style.display = 'none';
    });

    function startNewGame() {
        playerName = document.getElementById('player-name').value.trim();
        if (!playerName) {
            alert('Введите ваше имя перед началом игры.');
            return;
        }
        secretNumber = Math.floor(Math.random() * 100) + 1;
        attempts = [];
        document.getElementById('game-container').style.display = 'block';
        document.getElementById('game-status').textContent = 'Игра началась! Угадай число от 1 до 100.';
    }

    document.getElementById('guessBtn').addEventListener('click', makeGuess);

    function makeGuess() {
        const guess = parseInt(document.getElementById('guessInput').value);
        if (isNaN(guess) || guess < 1 || guess > 100) {
            alert('Введите число от 1 до 100.');
            return;
        }
        attempts.push(guess);
        let feedback = [];
        
        if (guess === secretNumber) {
            feedback.push('Вы угадали!');
            saveGameResult(true);
            document.getElementById('close-game').style.display = 'block';
        } else {
            const difference = Math.abs(secretNumber - guess);
            
            if (difference >= 20) {
                feedback.push('Очень холодно');
            } else if (difference >= 10) {
                feedback.push('Холодно');
            } else if (difference >= 5) {
                feedback.push('Тепло');
            } else {
                feedback.push('Очень горячо');
            }
        }
        
        displayFeedback(feedback.join(', '));
    }

    function displayFeedback(feedback) {
        document.getElementById('game-status').textContent = feedback;
    }

    async function saveGameResult(winStatus) {
        const gameData = {
            playerName,
            secretNumber,
            winStatus: winStatus ? 'Победа' : 'Поражение',
            timestamp: new Date().toISOString(),
            attempts, // Сохранение попыток
        };
        await saveGame(gameData);
    }

    async function displayPastGames() {
        const games = await getAllGames();
        
        const gameList = document.getElementById('game-list');
        const gameListContainer = document.getElementById('game-list-container');
        
        
        if (gameList) { // Добавьте проверку на существование
            document.getElementById('game-list').style.display = 'block';
            gameList.innerHTML = ''; // Очистим текущий список
            if (games.length) {
                games.forEach(game => {
                    const listItem = document.createElement('li');
                    const timestamp = new Date(game.timestamp).toLocaleString();
                    listItem.textContent = `Игрок: ${game.playerName} - Дата: ${timestamp} - Исход: ${game.winStatus}`;
                    listItem.addEventListener('click', () => replayGame(game.id));
                    gameList.appendChild(listItem);
                });
            } else {
                gameList.innerHTML = '<li>Нет сохраненных игр.</li>'; // Уведомление, если нет игр
            }
            document.getElementById('close-game-list').style.display = 'block';
        } else {
            console.error("Элемент с id 'game-list' не найден!");
        }
    }

    async function replayGame(id) {
        const gameData = await getGameById(id);
        if (!gameData) {
            alert('Игра не найдена!');
            return;
        }
        alert(`История игры: ${gameData.attempts.join(', ')}`);
    }
});
