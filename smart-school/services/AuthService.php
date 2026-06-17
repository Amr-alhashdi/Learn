<?php
// services/AuthService.php
// Business logic for Authentication

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Auth;
use Core\Response;

class AuthService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function login(string $identifier, string $password): array
    {
        // Identifier can be email or phone
        $user = $this->db->fetchOne(
            "SELECT id, password_hash, role, is_active FROM users WHERE email = :id OR phone = :id LIMIT 1",
            ['id' => $identifier]
        );

        if (!$user || !password_verify($password, $user['password_hash'])) {
            Response::unauthorized('بيانات الدخول غير صحيحة');
        }

        if (!$user['is_active']) {
            Response::forbidden('الحساب غير مفعل');
        }

        // Get associated school IDs (except for super_admin and parent)
        $schoolIds = [];
        if ($user['role'] === 'school_admin') {
            $schools = $this->db->fetchAll("SELECT school_id FROM school_admins WHERE user_id = ?", [$user['id']]);
            $schoolIds = array_column($schools, 'school_id');
        } elseif ($user['role'] === 'teacher') {
            $schools = $this->db->fetchAll("SELECT DISTINCT school_id FROM teacher_assignments WHERE teacher_id = (SELECT id FROM teachers WHERE user_id = ?)", [$user['id']]);
            $schoolIds = array_column($schools, 'school_id');
        } elseif ($user['role'] === 'student') {
             $student = $this->db->fetchOne("SELECT school_id FROM students WHERE user_id = ?", [$user['id']]);
             if($student) $schoolIds[] = $student['school_id'];
        }

        // Generate tokens
        $payload = [
            'user_id'    => $user['id'],
            'role'       => $user['role'],
            'school_ids' => $schoolIds
        ];

        $accessToken  = Auth::generateAccessToken($payload);
        $refreshToken = Auth::generateRefreshToken();

        // Save refresh token
        $config = require __DIR__ . '/../config/jwt.php';
        $expiresAt = date('Y-m-d H:i:s', time() + $config['refresh_ttl']);
        
        $this->db->insert('refresh_tokens', [
            'user_id'    => $user['id'],
            'token'      => $refreshToken,
            'expires_at' => $expiresAt
        ]);

        // Update last login
        $this->db->update('users', ['last_login' => date('Y-m-d H:i:s')], ['id' => $user['id']]);

        // Log audit
        $this->db->insert('audit_logs', [
            'user_id' => $user['id'],
            'action'  => 'LOGIN',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);

        return [
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken,
            'user'          => [
                'id'         => $user['id'],
                'role'       => $user['role'],
                'school_ids' => $schoolIds
            ]
        ];
    }

    public function refresh(string $refreshToken): array
    {
        $tokenRecord = $this->db->fetchOne(
            "SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()",
            [$refreshToken]
        );

        if (!$tokenRecord) {
            Response::unauthorized('رمز التجديد غير صالح أو منتهي الصلاحية');
        }

        $user = $this->db->fetchOne("SELECT id, role, is_active FROM users WHERE id = ?", [$tokenRecord['user_id']]);
        
        if (!$user || !$user['is_active']) {
            Response::unauthorized('المستخدم غير موجود أو حسابه موقوف');
        }

        // We should recalculate school IDs to ensure they are up to date
        // For simplicity in refresh, we could just query them again or store them in DB.
        // Doing the query again:
        $schoolIds = [];
        if ($user['role'] === 'school_admin') {
            $schools = $this->db->fetchAll("SELECT school_id FROM school_admins WHERE user_id = ?", [$user['id']]);
            $schoolIds = array_column($schools, 'school_id');
        } elseif ($user['role'] === 'teacher') {
            $schools = $this->db->fetchAll("SELECT DISTINCT school_id FROM teacher_assignments WHERE teacher_id = (SELECT id FROM teachers WHERE user_id = ?)", [$user['id']]);
            $schoolIds = array_column($schools, 'school_id');
        } elseif ($user['role'] === 'student') {
             $student = $this->db->fetchOne("SELECT school_id FROM students WHERE user_id = ?", [$user['id']]);
             if($student) $schoolIds[] = $student['school_id'];
        }

        // Generate new tokens
        $payload = [
            'user_id'    => $user['id'],
            'role'       => $user['role'],
            'school_ids' => $schoolIds
        ];

        $newAccessToken  = Auth::generateAccessToken($payload);
        $newRefreshToken = Auth::generateRefreshToken();

        // Replace old refresh token with new one
        $config = require __DIR__ . '/../config/jwt.php';
        $expiresAt = date('Y-m-d H:i:s', time() + $config['refresh_ttl']);

        $this->db->delete('refresh_tokens', ['id' => $tokenRecord['id']]);
        $this->db->insert('refresh_tokens', [
            'user_id'    => $user['id'],
            'token'      => $newRefreshToken,
            'expires_at' => $expiresAt
        ]);

        return [
            'access_token'  => $newAccessToken,
            'refresh_token' => $newRefreshToken
        ];
    }

    public function logout(string $refreshToken): void
    {
        $this->db->delete('refresh_tokens', ['token' => $refreshToken]);
    }
}
