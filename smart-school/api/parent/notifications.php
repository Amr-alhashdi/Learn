<?php
// api/parent/notifications.php

use Core\Response;
use Core\Auth;

/** @var \Core\Request $req */

$method = $req->method();
$currentUser = Auth::user($req);

if ($method === 'GET') {
    $db = \Core\Database::getInstance();
    
    // Fetch notifications
    $notifications = $db->fetchAll(
        "SELECT id, title, body, type, source, ref_type, ref_id, is_read, created_at 
         FROM notifications 
         WHERE user_id = ? 
         ORDER BY created_at DESC LIMIT 50",
        [$currentUser['id']]
    );

    // Mark as read
    $db->query(
        "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
        [$currentUser['id']]
    );

    Response::success($notifications);
} else {
    Response::error('Method Not Allowed', 405);
}
