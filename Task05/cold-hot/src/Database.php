<?php

namespace KirillSher\ColdHot;

use \RedBeanPHP\R as R;

class Database
{
    public function __construct()
    {
        R::setup('sqlite:' . __DIR__ . '/../data/cold-hot.db');
    }

    public function saveGame(array $data)
    {
        $game = R::dispense('game');
        $game->player_name = $data['player_name'];
        $game->field_size = $data['field_size'];
        $game->target_number = $data['target_number'];
        $game->start_time = date('Y-m-d H:i:s');
        $game->attempts = $data['attempts'];
        $game->result = $data['result'];
        return R::store($game);
    }

    public function updateGame(int $id, array $data)
    {
        $game = R::load('game', $id);
        if (! $game->id) return false;
        $game->attempts = $data['attempts'];
        $game->result = $data['result'];
        $game->end_time = date('Y-m-d H:i:s');
        return R::store($game);
    }

    public function saveMove(int $game_id, int $move_number, int $guess, string $feedback)
    {
        $move = R::dispense('move');
        $move->game = R::load('game', $game_id);
        $move->move_number = $move_number;
        $move->guess = $guess;
        $move->feedback = $feedback;
        $move->time = date('Y-m-d H:i:s');
        return R::store($move);
    }

    public function getGameById(int $id)
    {
        return R::load('game', $id);
    }

    public function getGames()
    {
        return R::findAll('game', ' ORDER BY start_time DESC ');
    }

    public function getMovesByGameId(int $game_id)
    {
        return R::findAll('move', ' game_id = ? ORDER BY move_number ASC ', [$game_id]);
    }
}
