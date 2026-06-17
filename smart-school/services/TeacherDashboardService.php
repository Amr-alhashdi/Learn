<?php
// services/TeacherDashboardService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class TeacherDashboardService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    private function getTeacherId(int $userId): int
    {
        $teacher = $this->db->fetchOne("SELECT id FROM teachers WHERE user_id = ?", [$userId]);
        if (!$teacher) Response::forbidden('بيانات المعلم غير مكتملة');
        return $teacher['id'];
    }

    public function getSchools(int $userId): array
    {
        $teacherId = $this->getTeacherId($userId);
        $sql = "SELECT DISTINCT s.id, s.name, s.logo 
                FROM schools s
                JOIN teacher_assignments ta ON ta.school_id = s.id
                WHERE ta.teacher_id = ?";
        return $this->db->fetchAll($sql, [$teacherId]);
    }

    public function getClasses(int $userId, int $schoolId): array
    {
        $teacherId = $this->getTeacherId($userId);
        
        // Ensure teacher is actually assigned to this school
        $this->verifyAssignment($teacherId, $schoolId);

        $sql = "SELECT DISTINCT c.id, c.name, g.name as grade_name
                FROM classes c
                JOIN teacher_assignments ta ON ta.class_id = c.id
                JOIN grade_levels g ON c.grade_level_id = g.id
                WHERE ta.teacher_id = ? AND ta.school_id = ?
                ORDER BY g.order_num ASC, c.name ASC";
        return $this->db->fetchAll($sql, [$teacherId, $schoolId]);
    }

    public function getSubjects(int $userId, int $schoolId, int $classId): array
    {
        $teacherId = $this->getTeacherId($userId);
        $this->verifyAssignment($teacherId, $schoolId, $classId);

        $sql = "SELECT DISTINCT s.id, s.name, s.icon, s.color
                FROM subjects s
                JOIN teacher_assignments ta ON ta.subject_id = s.id
                WHERE ta.teacher_id = ? AND ta.school_id = ? AND ta.class_id = ?";
        return $this->db->fetchAll($sql, [$teacherId, $schoolId, $classId]);
    }

    public function getStudents(int $userId, int $schoolId, int $classId): array
    {
        $teacherId = $this->getTeacherId($userId);
        $this->verifyAssignment($teacherId, $schoolId, $classId);

        $sql = "SELECT st.id, st.student_code, u.name, u.avatar
                FROM students st
                JOIN users u ON st.user_id = u.id
                WHERE st.school_id = ? AND st.class_id = ? AND st.status = 'active'
                ORDER BY u.name ASC";
        return $this->db->fetchAll($sql, [$schoolId, $classId]);
    }

    private function verifyAssignment(int $teacherId, int $schoolId, ?int $classId = null, ?int $subjectId = null): void
    {
        $params = [$teacherId, $schoolId];
        $where = "teacher_id = ? AND school_id = ?";

        if ($classId) {
            $where .= " AND class_id = ?";
            $params[] = $classId;
        }
        if ($subjectId) {
            $where .= " AND subject_id = ?";
            $params[] = $subjectId;
        }

        $valid = $this->db->fetchOne("SELECT id FROM teacher_assignments WHERE {$where} LIMIT 1", $params);
        if (!$valid) {
            Response::forbidden('ليس لديك صلاحية على هذا الصف أو المادة');
        }
    }
}
