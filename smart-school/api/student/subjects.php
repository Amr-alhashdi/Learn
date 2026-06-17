<?php
// api/student/subjects.php

use Core\Response;
use Core\Auth;
use Services\StudentService;

/** @var \Core\Request $req */

$method = $req->method();
$service = new StudentService();
$currentUser = Auth::user($req);

if ($method === 'GET') {
    $subjectId = (int)$req->param('id');
    $path = $req->path();

    if ($subjectId) {
        if (str_ends_with($path, '/content')) {
            Response::success($service->getSubjectContent($currentUser['id'], $subjectId));
        } elseif (str_ends_with($path, '/assignments')) {
            Response::success($service->getSubjectAssignments($currentUser['id'], $subjectId));
        } else {
            Response::error('Action not supported', 400);
        }
    } else {
        // List all subjects
        Response::success($service->getSubjects($currentUser['id']));
    }
} else {
    Response::error('Method Not Allowed', 405);
}
