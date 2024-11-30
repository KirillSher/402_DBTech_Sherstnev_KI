class Database {
    constructor(dbName = 'coldhotdb', storeName = 'games') {
        this.dbName = dbName;
        this.storeName = storeName;
        this.dbPromise = null;
    }

    async open() {
        if (!this.dbPromise) {
            this.dbPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, 1);

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                };

                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };

                request.onerror = (event) => {
                    reject(event.target.error);
                };
            });
        }
        return this.dbPromise;
    }

    async saveGame(gameData) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.put(gameData);
           
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                console.error('Error saving game:', request.error);
                reject(request.error);
            };
        });
    }

    async getGames() {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                console.error('Error fetching games:', request.error);
                reject(request.error);
            };
        });
    }

    async saveMove(gameId, moveData) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.get(gameId);
            request.onsuccess = (event) => {
                const game = event.target.result;

                if (game) {
                    game.moves = game.moves || [];
                    game.moves.push(moveData);
                    const updateRequest = objectStore.put(game);
                    updateRequest.onsuccess = () => resolve(updateRequest.result);
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    reject(new Error(`Game with ID ${gameId} not found`));
                }
            };
            request.onerror = () => {
                console.error('Error fetching game for move:', request.error);
                reject(request.error);
            };
        });
    }

    async close() {
        if (this.dbPromise) {
            const db = await this.dbPromise;
            db.close();
        }
    }
}