const ui = new UI();
const db = new Database();
let game;
let gameId;
let playerName; // Переменная для хранения имени игрока

const params = new URLSearchParams(window.location.search);
const fieldSize = params.get('fieldSize') || 100;
ui.setFieldSize(fieldSize);

ui.newGameButton.addEventListener('click', async () => {
    game = new Game(fieldSize);
    playerName = prompt('Enter your name'); // Сохраняем имя игрока
    if (!playerName) {
        alert('Please enter a valid name.');
        return;  // Проверка на пустое имя
    }

    const gameData = {
        player_name: playerName,
        field_size: fieldSize,
        target_number: game.getTargetNumber(),
        start_time: formatDate(new Date()),
        attempts: 0,
        result: 'In progress',
        moves: []
    };
    gameId = await db.saveGame(gameData);
    ui.showGameScreen();
    ui.updateGameScreen(0, "Make a guess");
});

ui.submitGuessButton.addEventListener('click', ui.handleSubmitGuess.bind(ui));

ui.viewHistoryButton.addEventListener('click', async () => {
    try {
        const games = await db.getGames(); // Получаем историю игр
        ui.displayGameHistory(games);
        ui.showHistoryScreen();
    } catch (error) {
        console.error('Error fetching game history:', error);
        ui.showFeedback('Error fetching game history. Please try again later.');
    }
});

ui.clearHistoryButton.addEventListener('click', ui.handleClearHistory.bind(ui));
