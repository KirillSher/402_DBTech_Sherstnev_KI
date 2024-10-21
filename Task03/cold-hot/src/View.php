<?php

namespace KirillSher\ColdHot\View;

use cli; // Подключение функционала wp-cli/php-cli-tools

function showStartScreen() {
    cli\line("Welcome to Cold-hot!");
}

function getUserInput() {
    // Использование \cli\prompt для получения ввода от пользователя
    return cli\prompt('Enter your guess');
}

function showFeedback($feedback) {
    cli\line($feedback);
}
