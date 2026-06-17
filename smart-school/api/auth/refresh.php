<?php
// api/auth/refresh.php

use Core\Validator;
use Core\Response;
use Services\AuthService;

/** @var \Core\Request $req */

$v = Validator::make($req->all(), [
    'refresh_token' => 'required|string'
]);

$v->failAndRespond();
$data = $v->validated();

$authService = new AuthService();
$result = $authService->refresh($data['refresh_token']);

Response::success($result, 'تم تجديد الرمز بنجاح');
