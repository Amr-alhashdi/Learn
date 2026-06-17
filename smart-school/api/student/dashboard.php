<?php
// api/student/dashboard.php

use Core\Response;
use Core\Auth;
use Services\StudentService;

/** @var \Core\Request $req */

$method = $req->method();
$service = new StudentService();
$currentUser = Auth::user($req);

if ($method === 'GET') {
    Response::success($service->getDashboard($currentUser['id']));
} else {
    Response::error('Method Not Allowed', 405);
}
