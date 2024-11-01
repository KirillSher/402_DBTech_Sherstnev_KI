<?php

namespace KirillSher\ColdHot\Controller;

use KirillSher\ColdHot\View;
use KirillSher\ColdHot\Game;
use KirillSher\ColdHot\Database;

function startGame()
{
    View\showStartScreen();
    $playerName = View\getUserInput('Enter your name');
    $fieldSize = View\getUserInput('Enter field size (1-100)');
    $game = new Game($fieldSize);

    $db = new Database();
    try {
        $gameId = $db->saveGame([
            'player_name' => $playerName,
            'field_size' => $fieldSize,
            'target_number' => $game->getTargetNumber(),
            'start_time' => date('Y-m-d H:i:s'),
            'attempts' => 0,
            'result' => 'In progress',
        ]);
    
        do {
            $guess = View\getUserInput("Enter your guess (1-$fieldSize)");
            $feedback = $game->checkGuess((int) $guess, $fieldSize);
            View\showFeedback($feedback);
    
            $db->saveMove($gameId, $game->getAttempts(), (int)$guess, $feedback);
    
        } while (!$game->isCorrectGuess((int) $guess));
    
        $db->updateGame($gameId, [
            'attempts' => $game->getAttempts(),
            'result' => 'Won',
            'end_time' => date('Y-m-d H:i:s'),
        ]);
    
        View\showFeedback("Congratulations! You've guessed the number in " . $game->getAttempts() . " attempts.");
    } catch (\Exception $e) {
        View\showFeedback('An error occurred: ' . $e->getMessage());
    }
}

function showGameHistory()
{
    $db = new Database();
    $games = $db->getGames();

    if (empty($games)) {
        View\showFeedback('No games found');
        return;
    }

    View\showFeedback("Available games:");
    foreach ($games as $game) {
        View\showFeedback("ID: {$game['id']}, Player: {$game['player_name']}, Field size: {$game['field_size']}, Start time: {$game['start_time']}, Result: {$game['result']}");
    }

    $gameId = View\getUserInput('Enter game ID to replay');

    // Получение информации об игре и ходах
    $game = $db->getGameById((int)$gameId);
    $moves = $db->getMovesByGameId((int)$gameId);

    // Отображение информации о игре и ходах
    View\showGameReplay($game, $moves);
}
