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

        // Trigger notifications for absent students
        $attDetails = $this->db->fetchOne(
            "SELECT a.student_id, a.status, a.date, u.name as student_name 
             FROM attendance a 
             JOIN students s ON a.student_id = s.id 
             JOIN users u ON s.user_id = u.id 
             WHERE a.id = ?",
            [$attendanceId]
        );

        if ($attDetails && $attDetails['status'] === 'absent') {
            $notificationService = new NotificationService();
            $studentName = $attDetails['student_name'];
            $date = $attDetails['date'];
            
            $title = "تنبيه غياب طالب";
            $body = "نود إحاطتكم علماً بأن ابنكم {$studentName} كان غائباً اليوم بتاريخ {$date}.";
            
            $notificationService->sendToParentsByStudentId(
                (int)$attDetails['student_id'],
                $title,
                $body,
                'absence',
                'school',
                'attendance',
                $attendanceId
            );
        }
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

        // Trigger notifications for student and parent
        $gradeDetails = $this->db->fetchOne(
            "SELECT g.student_id, g.score, g.max_score, sub.name as subject_name, st.user_id as student_user_id, u.name as student_name
             FROM grades g
             JOIN students st ON g.student_id = st.id
             JOIN users u ON st.user_id = u.id
             JOIN subjects sub ON g.subject_id = sub.id
             WHERE g.id = ?",
            [$gradeId]
        );

        if ($gradeDetails) {
            $notificationService = new NotificationService();
            $studentUserId = (int)$gradeDetails['student_user_id'];
            $studentId = (int)$gradeDetails['student_id'];
            $subjectName = $gradeDetails['subject_name'];
            $score = $gradeDetails['score'];
            $maxScore = $gradeDetails['max_score'];
            $studentName = $gradeDetails['student_name'];

            // 1. Notify Student
            $sTitle = "اعتماد درجات جديدة";
            $sBody = "تم اعتماد درجتك في مادة {$subjectName}: {$score}/{$maxScore}.";
            $notificationService->send($studentUserId, $sTitle, $sBody, 'grade', 'school', 'grade', $gradeId, $schoolId);

            // 2. Notify Parent
            $pTitle = "درجات جديدة معتمدة لابنكم";
            $pBody = "تم اعتماد درجة ابنكم {$studentName} في مادة {$subjectName}: {$score}/{$maxScore}.";
            $notificationService->sendToParentsByStudentId($studentId, $pTitle, $pBody, 'grade', 'school', 'grade', $gradeId);
        }
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
