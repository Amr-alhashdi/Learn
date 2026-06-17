<?php
// api/parent/children.php

use Core\Response;
use Core\Auth;
use Services\ParentService;
use Services\StudentService;

/** @var \Core\Request $req */

$method = $req->method();
$parentService = new ParentService();
$studentService = new StudentService();
$currentUser = Auth::user($req);

if ($method === 'GET') {
    $studentId = (int)$req->param('id');
    $path = $req->path();

    if ($studentId) {
        // Parent wants to see child details
        $parentService->verifyChild($currentUser['id'], $studentId);

        // Find child's user_id to use StudentService
        $db = \Core\Database::getInstance();
        $child = $db->fetchOne("SELECT user_id FROM students WHERE id = ?", [$studentId]);
        
        if (str_ends_with($path, '/dashboard')) {
            Response::success($studentService->getDashboard($child['user_id']));
        } elseif (str_ends_with($path, '/grades')) {
            Response::success($studentService->getGrades($child['user_id']));
        } elseif (str_ends_with($path, '/attendance')) {
            Response::success($studentService->getAttendance($child['user_id']));
        } else {
            Response::error('Action not supported', 400);
        }
    } else {
        // List all children
        Response::success($parentService->getChildren($currentUser['id']));
    }
} else {
    Response::error('Method Not Allowed', 405);
}
