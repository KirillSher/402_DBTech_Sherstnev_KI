class UI {
    constructor() {
        this.gameScreen = document.getElementById('game-screen');
        this.historyScreen = document.getElementById('history-screen');
        this.startScreen = document.getElementById('start-screen');
        this.resultScreen = document.getElementById('result-screen');
        this.feedbackArea = document.getElementById('feedback');
        this.guessInput = document.getElementById('guess');
        this.submitGuessButton = document.getElementById('submit-guess');
        this.newGameButton = document.getElementById('new-game');
        this.viewHistoryButton = document.getElementById('view-history');
        this.newgameFromResultButton = document.getElementById('new-game-from-result');
        this.viewHistoryFromResultButton = document.getElementById('view-history-from-result');
        this.clearHistoryButton = document.getElementById('clear-history');
        this.backToGameButton = document.getElementById('back-to-game');
        this.gameHistoryList = document.getElementById('game-history');
        this.fieldSizeSpan = document.getElementById('field-size');
        this.emptyHistoryMessage = document.getElementById('empty-history-message');

        this.init();
    }

    init() {
        this.addEventListeners();
    }

    showStartScreen() {
        this.startScreen.style.display = 'block';
        this.gameScreen.style.display = 'none';
        this.historyScreen.style.display = 'none';
        this.resultScreen.style.display = 'none';
    }

    showGameScreen() {
        this.startScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';
        this.historyScreen.style.display = 'none';
        this.resultScreen.style.display = 'none';
    }

    showHistoryScreen() {
        this.startScreen.style.display = 'none';
        this.gameScreen.style.display = 'none';
        this.historyScreen.style.display = 'block';
        this.resultScreen.style.display = 'none';
    }

    showResultScreen(attempts) {
        this.startScreen.style.display = 'none';
        this.gameScreen.style.display = 'none';
        this.historyScreen.style.display = 'none';
        this.resultScreen.style.display = 'block';
        this.resultScreen.querySelector('#result-message').textContent = `You guessed the number in ${attempts} attempts!`;
    }

    showFeedback(feedback) {
        this.feedbackArea.textContent = feedback;
    }

    addEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            if (this.viewHistoryButton) {
                this.viewHistoryButton.addEventListener('click', this.handleViewHistory.bind(this));
            }
            if (this.newGameButton) {
                this.newGameButton.addEventListener('click', this.handleNewGame.bind(this));
            }
            if (this.newgameFromResultButton) {
                this.newgameFromResultButton.addEventListener('click', this.handleNewGame.bind(this));
            }
            if (this.viewHistoryFromResultButton) {
                this.viewHistoryFromResultButton.addEventListener('click', this.handleViewHistory.bind(this));
            }
            if (this.clearHistoryButton) {
                this.clearHistoryButton.addEventListener('click', this.handleClearHistory.bind(this));
            }
            if (this.backToGameButton) {
                this.backToGameButton.addEventListener('click', this.handleBackToGame.bind(this));
            }
            if (this.submitGuessButton) {
                this.submitGuessButton.addEventListener('click', this.handleSubmitGuess.bind(this));
            }
        });
    }

    handleClearHistory = async () => {
        const db = new Database();
        if (confirm("Are you sure you want to clear the game history? This cannot be undone.")) {
            try {
                const database = await db.open();
                const transaction = database.transaction([db.storeName], 'readwrite');
                const objectStore = transaction.objectStore(db.storeName);
                const clearRequest = objectStore.clear();
                clearRequest.onsuccess = () => {
                    this.showFeedback('Game history cleared.');
                    this.displayGameHistory([]);
              
                    const deleteRequest = indexedDB.deleteDatabase(database.dbName);
                    deleteRequest.onsuccess = () => {
                        console.log('Database cleared and reset, ready for new games.');
                    };
                };
                clearRequest.onerror = (error) => {
                    this.showFeedback('Error clearing history. Please try again.');
                    console.error('Clear history error:', error);
                };
            } catch (error) {
                this.showFeedback('Error accessing database. Please try again.');
                console.error('Database access error:', error);
            } finally {
                await db.close();
            }
        }
    }

    handleNewGame() {
        this.showGameScreen();
    }

    handleBackToGame() {
        this.showStartScreen();
    }

    handleViewHistory = async () => {
        const db = new Database();
        try {
            const games = await db.getGames();
            this.displayGameHistory(games);
            this.showHistoryScreen();
        } catch (error) {
            console.error('Error fetching game history:', error);
            this.showFeedback('Error fetching game history. Please try again later.');
        } finally {
            await db.close();
        }
    }

    handleSubmitGuess = async () => {
        const guess = parseInt(this.guessInput.value, 10);
        if (isNaN(guess)) {
            this.showFeedback('Please enter a valid number.');
            return;
        }
        console.log(fieldSize)
        const feedback = game.checkGuess(guess, fieldSize);
        this.updateGameScreen(game.getAttempts(), feedback);
        await db.saveMove(gameId, { move_number: game.getAttempts(), guess, feedback, time: new Date().toISOString() });

        if (game.isCorrectGuess(guess)) {
            await db.saveGame({
                id: gameId,
                player_name: playerName,
                field_size: fieldSize,
                start_time: game.start_time,
                result: 'Won',
                attempts: game.getAttempts(),
                end_time: formatDate(new Date()) });
            this.showResultScreen(game.getAttempts());
        }
    }

    updateGameScreen(attempts, feedback) {
        this.showFeedback(feedback);
    }

    displayGameHistory(games) {
        this.gameHistoryList.innerHTML = '';
        this.emptyHistoryMessage.style.display = 'none';
        if (games.length === 0) {
            this.emptyHistoryMessage.style.display = 'block';
            return;
        }
        games.forEach(game => {
            const li = document.createElement('li');
            li.textContent = `ID: ${game.id}, Player: ${game.player_name || 'Anonymous'}, Field size: ${game.field_size}, Start time: ${game.start_time}, End time: ${game.end_time}, Result: ${game.result}, Attempts: ${game.attempts}`;
            this.gameHistoryList.appendChild(li);
        });
    }

    setFieldSize(size) {
        this.fieldSize = size;
        this.fieldSizeSpan.textContent = size;
    }
}
