<?php
// services/ApprovalService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class ApprovalService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    // -------------------------------------------------------
    // Attendance Approval
    // -------------------------------------------------------
    public function getPendingAttendance(int $schoolId, array $filters): array
    {
        $params = [$schoolId, 'pending'];
        $where = "c.school_id = ? AND a.approval_status = ?";

        if (!empty($filters['date'])) {
            $where .= " AND a.date = ?";
            $params[] = $filters['date'];
        }
        if (!empty($filters['class_id'])) {
            $where .= " AND a.class_id = ?";
            $params[] = $filters['class_id'];
        }

        $sql = "SELECT a.*, s.name as student_name, c.name as class_name, t.name as teacher_name
                FROM attendance a
                JOIN students st ON a.student_id = st.id
                JOIN users s ON st.user_id = s.id
                JOIN classes c ON a.class_id = c.id
                JOIN teachers th ON a.teacher_id = th.id
                JOIN users t ON th.user_id = t.id
                WHERE {$where}
                ORDER BY a.date DESC, c.name ASC";

        return $this->db->fetchAll($sql, $params);
    }

    public function approveAttendance(int $schoolId, int $attendanceId, int $adminUserId): void
    {
        // verify attendance belongs to school
        $record = $this->db->fetchOne(
            "SELECT a.id FROM attendance a JOIN classes c ON a.class_id = c.id WHERE a.id = ? AND c.school_id = ?",
            [$attendanceId, $schoolId]
        );
        if (!$record) Response::notFound('سجل الحضور غير موجود');

        $this->db->update('attendance', [
            'approval_status' => 'approved',
            'approved_by'     => $adminUserId,
            'approved_at'     => date('Y-m-d H:i:s')
        ], ['id' => $attendanceId]);

        // TODO: trigger NotificationService
    }

    public function rejectAttendance(int $schoolId, int $attendanceId, int $adminUserId): void
    {
        $record = $this->db->fetchOne(
            "SELECT a.id FROM attendance a JOIN classes c ON a.class_id = c.id WHERE a.id = ? AND c.school_id = ?",
            [$attendanceId, $schoolId]
        );
        if (!$record) Response::notFound('سجل الحضور غير موجود');

        $this->db->update('attendance', [
            'approval_status' => 'rejected',
            'approved_by'     => $adminUserId,
            'approved_at'     => date('Y-m-d H:i:s')
        ], ['id' => $attendanceId]);
    }

    // -------------------------------------------------------
    // Grades Approval
    // -------------------------------------------------------
    public function getPendingGrades(int $schoolId, array $filters): array
    {
        $params = [$schoolId, 'pending'];
        $where = "c.school_id = ? AND g.approval_status = ?";

        if (!empty($filters['class_id'])) {
            $where .= " AND g.class_id = ?";
            $params[] = $filters['class_id'];
        }

        $sql = "SELECT g.*, s.name as student_name, c.name as class_name, sub.name as subject_name, t.name as teacher_name
                FROM grades g
                JOIN students st ON g.student_id = st.id
                JOIN users s ON st.user_id = s.id
                JOIN classes c ON g.class_id = c.id
                JOIN subjects sub ON g.subject_id = sub.id
                JOIN teachers th ON g.teacher_id = th.id
                JOIN users t ON th.user_id = t.id
                WHERE {$where}
                ORDER BY g.created_at DESC";

        return $this->db->fetchAll($sql, $params);
    }

    public function approveGrade(int $schoolId, int $gradeId, int $adminUserId): void
    {
        $record = $this->db->fetchOne(
            "SELECT g.id FROM grades g JOIN classes c ON g.class_id = c.id WHERE g.id = ? AND c.school_id = ?",
            [$gradeId, $schoolId]
        );
        if (!$record) Response::notFound('سجل الدرجة غير موجود');

        $this->db->update('grades', [
            'approval_status' => 'approved',
            'approved_by'     => $adminUserId,
            'approved_at'     => date('Y-m-d H:i:s')
        ], ['id' => $gradeId]);

        // TODO: trigger NotificationService
    }

    public function rejectGrade(int $schoolId, int $gradeId, int $adminUserId): void
    {
        $record = $this->db->fetchOne(
            "SELECT g.id FROM grades g JOIN classes c ON g.class_id = c.id WHERE g.id = ? AND c.school_id = ?",
            [$gradeId, $schoolId]
        );
        if (!$record) Response::notFound('سجل الدرجة غير موجود');

        $this->db->update('grades', [
            'approval_status' => 'rejected',
            'approved_by'     => $adminUserId,
            'approved_at'     => date('Y-m-d H:i:s')
        ], ['id' => $gradeId]);
    }
}
