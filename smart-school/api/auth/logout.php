<?php
// api/auth/logout.php

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
$authService->logout($data['refresh_token']);

Response::success(null, 'تم تسجيل الخروج بنجاح');
