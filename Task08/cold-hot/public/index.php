<?php
require __DIR__ . '/../vendor/autoload.php';
use Slim\Factory\AppFactory;
use GuzzleHttp\Psr7\Utils;

$app = AppFactory::create();
$app->addErrorMiddleware(true, true, true);

$app->get('/', function ($request, $response) {
    return $response
        ->withHeader('Location', '/index.html')
        ->withStatus(302);
});

// Получение всех игр
$app->get('/games', function ($request, $response) {
    $db = new SQLite3(__DIR__ . '/../db/games.db');
    $result = $db->query('SELECT * FROM games');
    $games = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $games[] = $row;
    }
    return $response->withHeader('Content-Type', 'application/json')
        ->withBody(Utils::streamFor(json_encode($games)));
});

// Добавление новой игры
$app->post('/games', function ($request, $response) {
    $db = new SQLite3(__DIR__ . '/../db/games.db');
    $data = json_decode($request->getBody()->getContents(), true);

    error_log(print_r($data, true)); // Записываем данные в логи
    
    // Проверка на наличие данных
    if (!isset($data['playerName']) || !isset($data['secretNumber'])) {
        return $response->withStatus(400)->write('Данные недействительны');
    }

    $stmt = $db->prepare('INSERT INTO games (playerName, secretNumber, result, date) VALUES (?, ?, ?, ?)');
    $stmt->bindValue(1, $data['playerName']);
    $stmt->bindValue(2, $data['secretNumber']);
    $stmt->bindValue(3, 'В процессе');
    $stmt->bindValue(4, date('Y-m-d H:i:s'));

    if ($stmt->execute()) {
        $id = $db->lastInsertRowID();
        return $response->withHeader('Content-Type', 'application/json')
            ->withBody(Utils::streamFor(json_encode(['id' => $id])));
    } else {
        return $response->withStatus(500)->write('Ошибка при добавлении игры');
    }
});

// Просмотр определенной игры по ID
$app->get('/games/{id}', function ($request, $response, $args) {
    $gameId = $args['id'];
    $db = new SQLite3(__DIR__ . '/../db/games.db');

    // Получаем игру
    $stmt = $db->prepare('SELECT * FROM games WHERE id = ?');
    $stmt->bindValue(1, $gameId, SQLITE3_INTEGER);
    $game = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
    
    // Если игра не найдена
    if ($game === false) {
        return $response->withStatus(404)->write('Игра не найдена');
    }

    // Получаем попытки для данной игры
    $stmt = $db->prepare('SELECT * FROM attempts WHERE game_id = ? ORDER BY attemptNumber');
    $stmt->bindValue(1, $gameId, SQLITE3_INTEGER);
    $attemptsResult = $stmt->execute();
    
    $attempts = [];
    while ($row = $attemptsResult->fetchArray(SQLITE3_ASSOC)) {
        $attempts[] = $row;
    }

    // Собираем данные для ответа
    $gameData = [
        'game' => $game,
        'attempts' => $attempts
    ];

    return $response->withHeader('Content-Type', 'application/json')
        ->withBody(Utils::streamFor(json_encode($gameData)));
});

// Обновление статуса игры
$app->patch('/games/{id}', function ($request, $response, $args) {
    $db = new SQLite3(__DIR__ . '/../db/games.db');
    $id = (int)$args['id'];
    $data = json_decode($request->getBody()->getContents(), true);
    
    // Проверяем на наличие требуемых данных
    if (!isset($data['result'])) {
        return $response->withStatus(400)->write('Данные недействительны');
    }

    $stmt = $db->prepare('UPDATE games SET result = ? WHERE id = ?');
    $stmt->bindValue(1, $data['result']);
    $stmt->bindValue(2, $id, SQLITE3_INTEGER);
    
    if ($stmt->execute()) {
        return $response->withStatus(200);
    } else {
        return $response->withStatus(500)->write('Ошибка при обновлении статуса игры');
    }
});

// Сохранение попытки
$app->post('/attempts', function ($request, $response) {
    $db = new SQLite3(__DIR__ . '/../db/games.db');
    $data = json_decode($request->getBody()->getContents(), true);
    $stmt = $db->prepare('INSERT INTO attempts (game_id, attemptNumber, guess, hint) VALUES (?, ?, ?, ?)');
    $stmt->bindValue(1, $data['gameId']);
    $stmt->bindValue(2, $data['attemptNumber']);
    $stmt->bindValue(3, $data['guess']);
    $stmt->bindValue(4, $data['hint']);
    $stmt->execute();
    return $response->withStatus(201);
});

// Очистка базы данных
$app->post('/clear-db', function ($request, $response) {
    $db = new SQLite3(__DIR__ . '/../db/games.db');
    $db->exec('DELETE FROM games');
    $db->exec('DELETE FROM attempts');
    return $response->withStatus(200);
});

$app->run();
