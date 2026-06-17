<?php
// services/TeacherAttendanceService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class TeacherAttendanceService
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

    public function recordAttendance(int $userId, array $data): void
    {
        $teacherId = $this->getTeacherId($userId);

        // Verify assignment
        $valid = $this->db->fetchOne(
            "SELECT id FROM teacher_assignments WHERE teacher_id = ? AND class_id = ? LIMIT 1",
            [$teacherId, $data['class_id']]
        );
        if (!$valid) Response::forbidden('ليس لديك صلاحية على هذا الصف');

        // $data['students'] is an array: [['student_id' => 1, 'status' => 'present', 'notes' => '']]
        $date = $data['date'] ?? date('Y-m-d');

        $this->db->transaction(function(Database $db) use ($teacherId, $data, $date) {
            foreach ($data['students'] as $student) {
                // Check if already recorded
                $existing = $db->fetchOne(
                    "SELECT id FROM attendance WHERE class_id = ? AND student_id = ? AND date = ?",
                    [$data['class_id'], $student['student_id'], $date]
                );

                if ($existing) {
                    // Update
                    $db->update('attendance', [
                        'status' => $student['status'],
                        'notes'  => $student['notes'] ?? null,
                        'teacher_id' => $teacherId,
                        // reset approval if it was changed
                        'approval_status' => 'pending' 
                    ], ['id' => $existing['id']]);
                } else {
                    // Insert
                    $db->insert('attendance', [
                        'class_id'   => $data['class_id'],
                        'student_id' => $student['student_id'],
                        'teacher_id' => $teacherId,
                        'date'       => $date,
                        'status'     => $student['status'],
                        'notes'      => $student['notes'] ?? null,
                        'approval_status' => 'pending'
                    ]);
                }
            }
        });
    }

    public function getAttendance(int $userId, int $classId, string $date): array
    {
        $teacherId = $this->getTeacherId($userId);

        $valid = $this->db->fetchOne(
            "SELECT id FROM teacher_assignments WHERE teacher_id = ? AND class_id = ? LIMIT 1",
            [$teacherId, $classId]
        );
        if (!$valid) Response::forbidden('ليس لديك صلاحية على هذا الصف');

        return $this->db->fetchAll(
            "SELECT a.id, a.student_id, a.status, a.notes, a.approval_status, u.name as student_name
             FROM attendance a
             JOIN students s ON a.student_id = s.id
             JOIN users u ON s.user_id = u.id
             WHERE a.class_id = ? AND a.date = ?
             ORDER BY u.name ASC",
            [$classId, $date]
        );
    }
}
