<?php
// api/student/grades.php

use Core\Response;
use Core\Auth;
use Services\StudentService;

/** @var \Core\Request $req */

$method = $req->method();
$service = new StudentService();
$currentUser = Auth::user($req);

if ($method === 'GET') {
    // If path is attendance, return attendance instead
    if (str_contains($req->path(), '/attendance')) {
        Response::success($service->getAttendance($currentUser['id']));
    } else {
        Response::success($service->getGrades($currentUser['id']));
    }
} else {
    Response::error('Method Not Allowed', 405);
}
