<?php
// services/NotificationService.php

declare(strict_types=1);

namespace Services;

use Core\Database;

class NotificationService
{
    private Database $db;
    private array $fcmConfig;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->fcmConfig = require __DIR__ . '/../config/fcm.php';
    }

    /**
     * Send a notification to a specific user
     */
    public function send(
        int $userId,
        string $title,
        string $body,
        string $type,
        string $source,
        ?string $refType = null,
        ?int $refId = null,
        ?int $schoolId = null
    ): void {
        // 1. Save to DB
        $notificationId = $this->db->insert('notifications', [
            'user_id'    => $userId,
            'school_id'  => $schoolId,
            'title'      => $title,
            'body'       => $body,
            'type'       => $type,
            'source'     => $source,
            'ref_type'   => $refType,
            'ref_id'     => $refId,
            'is_read'    => 0,
            'sent_via'   => $this->fcmConfig['enabled'] ? 'in_app,fcm' : 'in_app'
        ]);

        // 2. Push FCM if enabled and token exists
        if ($this->fcmConfig['enabled']) {
            $user = $this->db->fetchOne("SELECT fcm_token FROM users WHERE id = ?", [$userId]);
            if ($user && !empty($user['fcm_token'])) {
                $this->sendFCM($user['fcm_token'], $title, $body);
            }
        }
    }

    /**
     * Send notification to parent associated with a student
     */
    public function sendToParentsByStudentId(
        int $studentId,
        string $title,
        string $body,
        string $type,
        string $source,
        ?string $refType = null,
        ?int $refId = null
    ): void {
        // Get parent details via student parent_phone
        $student = $this->db->fetchOne("SELECT parent_phone, school_id FROM students WHERE id = ?", [$studentId]);
        if (!$student) {
            return;
        }

        $parent = $this->db->fetchOne("SELECT user_id FROM parents WHERE phone = ?", [$student['parent_phone']]);
        if ($parent) {
            $this->send(
                (int)$parent['user_id'],
                $title,
                $body,
                $type,
                $source,
                $refType,
                $refId,
                (int)$student['school_id']
            );
        }
    }

    /**
     * Broadcast notification to all students in a class
     */
    public function broadcastToClass(
        int $classId,
        string $title,
        string $body,
        string $type,
        string $source,
        ?string $refType = null,
        ?int $refId = null
    ): void {
        $students = $this->db->fetchAll(
            "SELECT user_id, school_id FROM students WHERE class_id = ? AND status = 'active'",
            [$classId]
        );

        foreach ($students as $student) {
            $this->send(
                (int)$student['user_id'],
                $title,
                $body,
                $type,
                $source,
                $refType,
                $refId,
                (int)$student['school_id']
            );
        }
    }

    /**
     * Call Firebase Cloud Messaging Legacy HTTP API
     */
    private function sendFCM(string $fcmToken, string $title, string $body): void
    {
        $serverKey = $this->fcmConfig['server_key'];
        $apiUrl = $this->fcmConfig['api_url'];

        if (empty($serverKey) || empty($apiUrl)) {
            error_log("FCM: Server Key or API URL not configured.");
            return;
        }

        $payload = [
            'to' => $fcmToken,
            'notification' => [
                'title' => $title,
                'body'  => $body,
                'sound' => 'default'
            ],
            'data' => [
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK'
            ]
        ];

        $ch = curl_init($apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: key=' . $serverKey
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5); // Short timeout for notifications

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false || $httpCode !== 200) {
            error_log("FCM: Failed pushing to token. Code: {$httpCode}. Error: " . curl_error($ch));
        }
    }
}
