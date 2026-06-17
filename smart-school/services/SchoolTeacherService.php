<?php
// services/SchoolTeacherService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class SchoolTeacherService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getAll(int $schoolId, int $page = 1, int $perPage = 20): array
    {
        // Teachers connected to this school via teacher_assignments
        $sql = "SELECT DISTINCT t.*, u.name, u.email, u.phone, u.is_active
                FROM teachers t
                JOIN users u ON t.user_id = u.id
                JOIN teacher_assignments ta ON ta.teacher_id = t.id
                WHERE ta.school_id = ?
                ORDER BY t.id DESC";
        
        return $this->db->paginate($sql, [$schoolId], $page, $perPage);
    }

    public function getById(int $schoolId, int $id): array
    {
        $sql = "SELECT t.*, u.name, u.email, u.phone, u.is_active
                FROM teachers t
                JOIN users u ON t.user_id = u.id
                WHERE t.id = ?";
                
        $teacher = $this->db->fetchOne($sql, [$id]);
        if (!$teacher) {
            Response::notFound('المعلم غير موجود');
        }

        // Get their assignments in this school
        $teacher['assignments'] = $this->db->fetchAll(
            "SELECT ta.id, c.name as class_name, s.name as subject_name, ay.name as academic_year
             FROM teacher_assignments ta
             JOIN classes c ON ta.class_id = c.id
             JOIN subjects s ON ta.subject_id = s.id
             JOIN academic_years ay ON ta.academic_year_id = ay.id
             WHERE ta.teacher_id = ? AND ta.school_id = ?",
            [$id, $schoolId]
        );

        return $teacher;
    }

    // Connect existing user as teacher, or create new user+teacher
    public function createOrAssign(int $schoolId, array $data): array
    {
        // If email or phone provided, check if user exists
        $userId = null;
        if (!empty($data['email']) || !empty($data['phone'])) {
            $user = $this->db->fetchOne(
                "SELECT id, role FROM users WHERE email = :e OR phone = :p LIMIT 1",
                ['e' => $data['email'] ?? null, 'p' => $data['phone'] ?? null]
            );

            if ($user) {
                if ($user['role'] !== 'teacher') {
                    Response::validationError(['user' => ['هذا الحساب موجود مسبقاً بدرو مختلف']]);
                }
                $userId = $user['id'];
            }
        }

        return $this->db->transaction(function(Database $db) use ($schoolId, $data, $userId) {
            if (!$userId) {
                if (empty($data['password'])) {
                    Response::validationError(['password' => ['كلمة المرور مطلوبة لإنشاء مستخدم جديد']]);
                }
                $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
                $userId = $db->insert('users', [
                    'name'          => $data['name'],
                    'email'         => $data['email'] ?? null,
                    'phone'         => $data['phone'] ?? null,
                    'password_hash' => $passwordHash,
                    'role'          => 'teacher',
                    'is_active'     => 1
                ]);
            }

            // check if teacher record exists
            $teacher = $db->fetchOne("SELECT id FROM teachers WHERE user_id = ?", [$userId]);
            if (!$teacher) {
                $teacherId = $db->insert('teachers', [
                    'user_id'        => $userId,
                    'specialization' => $data['specialization'] ?? null,
                    'qualification'  => $data['qualification'] ?? null,
                    'hire_date'      => $data['hire_date'] ?? date('Y-m-d')
                ]);
            } else {
                $teacherId = $teacher['id'];
            }

            // Assign to school/class/subject if provided
            if (!empty($data['class_id']) && !empty($data['subject_id'])) {
                // Ensure class and subject belong to school
                $class = $db->fetchOne("SELECT academic_year_id FROM classes WHERE id = ? AND school_id = ?", [$data['class_id'], $schoolId]);
                if (!$class) Response::validationError(['class_id' => ['الصف المحدد غير موجود']]);
                
                $subject = $db->fetchOne("SELECT id FROM subjects WHERE id = ? AND school_id = ?", [$data['subject_id'], $schoolId]);
                if (!$subject) Response::validationError(['subject_id' => ['المادة المحددة غير موجودة']]);

                // Create assignment
                try {
                    $db->insert('teacher_assignments', [
                        'teacher_id'       => $teacherId,
                        'school_id'        => $schoolId,
                        'class_id'         => $data['class_id'],
                        'subject_id'       => $data['subject_id'],
                        'academic_year_id' => $class['academic_year_id']
                    ]);
                } catch (\PDOException $e) {
                    // Ignore duplicate key exception
                    if ($e->getCode() != 23000) throw $e;
                }
            }

            return $this->getById($schoolId, $teacherId);
        });
    }

    public function removeAssignment(int $schoolId, int $teacherId, int $assignmentId): void
    {
        $this->db->delete('teacher_assignments', [
            'id' => $assignmentId,
            'teacher_id' => $teacherId,
            'school_id' => $schoolId
        ]);
    }
}
