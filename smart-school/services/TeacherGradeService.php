<?php
// services/TeacherGradeService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class TeacherGradeService
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

    public function recordGrades(int $userId, array $data): void
    {
        $teacherId = $this->getTeacherId($userId);

        // Verify assignment
        $valid = $this->db->fetchOne(
            "SELECT id FROM teacher_assignments WHERE teacher_id = ? AND class_id = ? AND subject_id = ? LIMIT 1",
            [$teacherId, $data['class_id'], $data['subject_id']]
        );
        if (!$valid) Response::forbidden('ليس لديك صلاحية لإدخال درجات هذه المادة لهذا الصف');

        $this->db->transaction(function(Database $db) use ($teacherId, $data) {
            foreach ($data['students'] as $student) {
                // Check if already recorded
                $existing = $db->fetchOne(
                    "SELECT id FROM grades WHERE class_id = ? AND subject_id = ? AND student_id = ? AND exam_type = ?",
                    [$data['class_id'], $data['subject_id'], $student['student_id'], $data['exam_type']]
                );

                if ($existing) {
                    // Update
                    $db->update('grades', [
                        'score' => $student['score'],
                        'max_score' => $data['max_score'] ?? 100,
                        'teacher_id' => $teacherId,
                        'approval_status' => 'pending' 
                    ], ['id' => $existing['id']]);
                } else {
                    // Insert
                    $db->insert('grades', [
                        'class_id'   => $data['class_id'],
                        'subject_id' => $data['subject_id'],
                        'student_id' => $student['student_id'],
                        'teacher_id' => $teacherId,
                        'exam_type'  => $data['exam_type'],
                        'score'      => $student['score'],
                        'max_score'  => $data['max_score'] ?? 100,
                        'approval_status' => 'pending'
                    ]);
                }
            }
        });
    }

    public function getGrades(int $userId, int $classId, int $subjectId, string $examType): array
    {
        $teacherId = $this->getTeacherId($userId);

        $valid = $this->db->fetchOne(
            "SELECT id FROM teacher_assignments WHERE teacher_id = ? AND class_id = ? AND subject_id = ? LIMIT 1",
            [$teacherId, $classId, $subjectId]
        );
        if (!$valid) Response::forbidden('ليس لديك صلاحية على هذا الصف أو المادة');

        return $this->db->fetchAll(
            "SELECT g.id, g.student_id, g.score, g.max_score, g.approval_status, u.name as student_name
             FROM grades g
             JOIN students s ON g.student_id = s.id
             JOIN users u ON s.user_id = u.id
             WHERE g.class_id = ? AND g.subject_id = ? AND g.exam_type = ?
             ORDER BY u.name ASC",
            [$classId, $subjectId, $examType]
        );
    }
}
