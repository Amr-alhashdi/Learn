<?php
// api/auth/login.php

use Core\Validator;
use Core\Response;
use Services\AuthService;

/** @var \Core\Request $req */

$v = Validator::make($req->all(), [
    'identifier' => 'required|string|min:3',
    'password'   => 'required|string|min:6'
]);

$v->failAndRespond();
$data = $v->validated();

$authService = new AuthService();
$result = $authService->login($data['identifier'], $data['password']);

Response::success($result, 'تم تسجيل الدخول بنجاح');
