<?php

namespace KirillSher\ColdHot\Controller;

use KirillSher\ColdHot\View;
use KirillSher\ColdHot\Game;
use KirillSher\ColdHot\Database;
use Exception; //для обработки исключений

class Controller {

    public static function startGame(Database $db): void
    {
        View::showStartScreen();
        $playerName = View::getUserInput('Enter your name');
        $fieldSize = (int)View::getUserInput('Enter field size (1-100)'); //явное приведение к числу

        $game = new Game($fieldSize);

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
                $guess = (int)View::getUserInput("Enter your guess (1-$fieldSize)"); //явное приведение к числу
                $feedback = $game->checkGuess($guess, $fieldSize);
                View::showFeedback($feedback);

                $db->saveMove($gameId, $game->getAttempts(), $guess, $feedback);

            } while (!$game->isCorrectGuess($guess));

            $db->updateGame($gameId, [
                'attempts' => $game->getAttempts(),
                'result' => 'Won',
                'end_time' => date('Y-m-d H:i:s'),
            ]);

            View::showFeedback("Congratulations! You've guessed the number in " . $game->getAttempts() . " attempts.");
        } catch (Exception $e) {
            View::showFeedback('An error occurred: ' . $e->getMessage());
            error_log("Error in startGame: " . $e->getMessage()); // логирование ошибки
        }
    }

    public static function showGameHistory(Database $db): void
    {
        $games = $db->getGames();

        if (empty($games)) {
            View::showFeedback('No games found');
            return;
        }

        View::showFeedback("Available games:");
        foreach ($games as $game) {
            View::showFeedback("ID: {$game->id}, Player: {$game->player_name}, Field size: {$game->field_size}, Start time: {$game->start_time}, Result: {$game->result}");
        }

        $gameId = (int)View::getUserInput('Enter game ID to replay'); //явное приведение к числу


        $game = $db->getGameById($gameId);
        if (!$game) {
            View::showFeedback("Game not found!");
            return;
        }
        $moves = $db->getMovesByGameId($gameId);

        View::showGameReplay($game, $moves);
    }
}
