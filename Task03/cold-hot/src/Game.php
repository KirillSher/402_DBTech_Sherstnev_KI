<?php

namespace KirillSher\ColdHot;

class Game {
    private $targetNumber;
    private $attempts = 0;
    private $lastGuess;

    public function __construct() {
        // Генерация случайного числа от 1 до 100
        $this->targetNumber = rand(1, 100);
    }

    public function checkGuess($guess) {
        if ($guess < 1 || $guess > 100) {
            return 'Please enter a number between 1 and 100.';
        }

        $this->attempts++;
        
        $difference = abs($guess - $this->targetNumber);

        // Логика для градации "горячее"/"холоднее"
        if ($difference > 50) {
            $feedback = 'Very cold';
        } elseif ($difference > 20) {
            $feedback = 'Cold';
        } elseif ($difference > 10) {
            $feedback = 'Warm';
        } elseif ($difference > 5) {
            $feedback = 'Hot';
        } elseif ($difference > 0) {
            $feedback = 'Very hot';
        } else {
            // Угадал число
            $feedback = 'Correct';
        }

        // Логика "hotter"/"colder" по сравнению с предыдущей догадкой
        if (isset($this->lastGuess)) {
            $previousDifference = abs($this->lastGuess - $this->targetNumber);
            if ($difference < $previousDifference) {
                $feedback .= ' and getting closer';
            } elseif ($difference > $previousDifference) {
                $feedback .= ' and getting farther';
            }
        }

        // Сохранение последней догадки
        $this->lastGuess = $guess;

        return $feedback;
    }

    public function isCorrectGuess($guess) {
        return $guess == $this->targetNumber;
    }

    public function getAttempts() {
        return $this->attempts;
    }
}
