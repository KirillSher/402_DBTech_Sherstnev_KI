<?php

namespace KirillSher\ColdHot\View;

use cli;

class View {

    public static function showStartScreen(): void {
        cli\line("Welcome to Cold-hot!");
    }

    public static function getUserInput(string $message = 'Enter your guess'): string {
        return cli\prompt($message);
    }

    public static function showFeedback(string $feedback): void {
        cli\line($feedback);
    }

    public static function showGameReplay(\RedBeanPHP\OODBBean $game, array $moves): void {
        $game_properties = get_object_vars($game); // Получение всех свойств объекта в виде массива
        foreach ($game_properties as $property => $value) {
            cli\line("$property: $value");
        }


        cli\line("\nMoves:");
        foreach ($moves as $move) {
            cli\line("Move {$move->move_number}: Guess {$move->guess}, Feedback {$move->feedback}, Time {$move->time}");
        }
    }
}
