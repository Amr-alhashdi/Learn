<?php
// services/ParentService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class ParentService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    private function getParentPhone(int $userId): string
    {
        $parent = $this->db->fetchOne("SELECT phone FROM parents WHERE user_id = ?", [$userId]);
        if (!$parent) {
            // fallback to user phone
            $user = $this->db->fetchOne("SELECT phone FROM users WHERE id = ?", [$userId]);
            if (!$user || !$user['phone']) Response::forbidden('رقم هاتف ولي الأمر غير مسجل');
            return $user['phone'];
        }
        return $parent['phone'];
    }

    public function getChildren(int $userId): array
    {
        $phone = $this->getParentPhone($userId);

        return $this->db->fetchAll(
            "SELECT s.id as student_id, s.student_code, s.school_id, s.class_id, u.name, c.name as class_name, sch.name as school_name
             FROM students s
             JOIN users u ON s.user_id = u.id
             JOIN classes c ON s.class_id = c.id
             JOIN schools sch ON s.school_id = sch.id
             WHERE s.parent_phone = ?",
            [$phone]
        );
    }

    // Reuse StudentService methods for a specific child
    // In a real app we'd verify the child belongs to the parent
    public function verifyChild(int $userId, int $studentId): void
    {
        $phone = $this->getParentPhone($userId);
        
        $valid = $this->db->fetchOne(
            "SELECT id FROM students WHERE id = ? AND parent_phone = ?",
            [$studentId, $phone]
        );
        if (!$valid) Response::forbidden('هذا الطالب غير مرتبط بحسابك');
    }
}
