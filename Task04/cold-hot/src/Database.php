<?php

namespace KirillSher\ColdHot;

use PDO;

class Database
{
    private $db;

    public function __construct()
    {
        // Подключение к базе данных
        $this->db = new PDO('sqlite:' . __DIR__ . '/../data/cold-hot.db');
        // Включение исключений для отладки
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    // Метод для создания таблицы игр
    public function createGameTable()
    {
        $sql = "CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_name TEXT,
            field_size INTEGER,
            target_number INTEGER,
            start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            end_time DATETIME,
            attempts INTEGER,
            result TEXT
        )";
        $this->db->exec($sql);
    }

    // Метод для создания таблицы ходов
    public function createMovesTable()
    {
        $sql = "CREATE TABLE IF NOT EXISTS moves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER,
            move_number INTEGER,
            guess INTEGER,
            feedback TEXT,
            time DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (game_id) REFERENCES games(id)
        )";
        $this->db->exec($sql);
    }

    // Метод для записи новой игры в базу данных
    public function saveGame(array $data)
    {
        $sql = "INSERT INTO games (player_name, field_size, target_number, start_time, attempts, result) VALUES (:player_name, :field_size, :target_number, :start_time, :attempts, :result)";
        return $this->execute($sql, $data);
    }


    // Метод обновления данных игры в таблице games
    public function updateGame(int $id, array $data)
    {
        $data[':id'] = $id;
        $sql = "UPDATE games SET attempts = :attempts, result = :result, end_time = :end_time WHERE id = :id";
        return $this->execute($sql, $data);
    }

    private function execute($sql, $data)
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($data);
        return $this->db->lastInsertId();
    }

    // Метод для записи хода в базу данных
    public function saveMove(int $game_id, int $move_number, int $guess, string $feedback)
    {
        $sql = "INSERT INTO moves (game_id, move_number, guess, feedback) VALUES (:game_id, :move_number, :guess, :feedback)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':game_id' => $game_id,
            ':move_number' => $move_number,
            ':guess' => $guess,
            ':feedback' => $feedback
        ]);
    }

    // Метод для получения информации о игре по ID
    public function getGameById(int $id)
    {
        $sql = "SELECT * FROM games WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Метод для получения списка игр
    public function getGames()
    {
        $sql = "SELECT * FROM games ORDER BY start_time DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Метод для получения списка ходов по ID игры
    public function getMovesByGameId(int $game_id)
    {
        $sql = "SELECT * FROM moves WHERE game_id = :game_id ORDER BY move_number ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['game_id' => $game_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

