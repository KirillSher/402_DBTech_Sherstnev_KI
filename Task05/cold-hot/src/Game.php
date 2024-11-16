<?php

namespace KirillSher\ColdHot;

class Game
{
    // Основные параметры игры
    private $targetNumber;
    private $attempts = 0;
    private $lastGuess;

    public function __construct($fieldSize = 100)
    {
        // Генерация случайного числа от 1 до fieldSize
        $this->targetNumber = rand(1, $fieldSize);
    }

    public function checkGuess($guess, $fieldSize)
    {
        if ($guess < 1 || $guess > $fieldSize) {
            return 'Please enter a number between 1 and '. $fieldSize .'.';
        }

        $this->attempts++;

        $difference = abs($guess - $this->targetNumber);

        // Логика для градации "горячее"/"холоднее"
        $feedback = $this->getFeedback($difference);

        // Логика "hotter"/"colder" по сравнению с предыдущей догадкой
        if (isset($this->lastGuess)) {
            $previousDifference = abs($this->lastGuess - $this->targetNumber);
            $feedback .= $this->getComparisonFeedback($difference, $previousDifference);
        }

        // Сохранение последней догадки
        $this->lastGuess = $guess;

        return $feedback;
    }

    private function getFeedback($difference)
    {
        // Логика для градации "горячее"/"холоднее"
        if ($difference > 50) {
            return 'Very cold';
        } elseif ($difference > 20) {
            return 'Cold';
        } elseif ($difference > 10) {
            return 'Warm';
        } elseif ($difference > 5) {
            return 'Hot';
        } elseif ($difference > 0) {
            return 'Very hot';
        } else {
            // Угадал число
            return 'Correct';
        }
    }

    private function getComparisonFeedback($difference, $previousDifference)
    {
        // Логика "горячее"/"холоднее" по сравнению с предыдущей догадкой
        if ($difference < $previousDifference) {
            return ' and getting closer';
        } elseif ($difference > $previousDifference) {
            return ' and getting farther';
        }
        return '';
    }

    public function isCorrectGuess($guess)
    {
        return $guess == $this->targetNumber;
    }

    public function getAttempts()
    {
        return $this->attempts;
    }

    public function getTargetNumber()
    {
        return $this->targetNumber;
    }
}
