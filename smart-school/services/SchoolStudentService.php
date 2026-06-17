<?php
// services/SchoolStudentService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class SchoolStudentService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getAll(int $schoolId, int $page = 1, int $perPage = 20, ?int $classId = null): array
    {
        $params = [$schoolId];
        $where = "s.school_id = ?";
        
        if ($classId) {
            $where .= " AND s.class_id = ?";
            $params[] = $classId;
        }

        $sql = "SELECT s.*, u.name, u.email, u.is_active, c.name as class_name
                FROM students s
                JOIN users u ON s.user_id = u.id
                JOIN classes c ON s.class_id = c.id
                WHERE {$where} 
                ORDER BY s.id DESC";
        
        return $this->db->paginate($sql, $params, $page, $perPage);
    }

    public function getById(int $schoolId, int $id): array
    {
        $sql = "SELECT s.*, u.name, u.email, u.phone, u.is_active, c.name as class_name
                FROM students s
                JOIN users u ON s.user_id = u.id
                JOIN classes c ON s.class_id = c.id
                WHERE s.id = ? AND s.school_id = ?";
                
        $student = $this->db->fetchOne($sql, [$id, $schoolId]);
        if (!$student) {
            Response::notFound('الطالب غير موجود');
        }
        return $student;
    }

    public function create(int $schoolId, array $data): array
    {
        // Check unique student code
        $exists = $this->db->fetchOne("SELECT id FROM students WHERE student_code = ?", [$data['student_code']]);
        if ($exists) {
            Response::validationError(['student_code' => ['الرقم الأكاديمي مستخدم بالفعل']]);
        }

        // Check if class belongs to this school
        $class = $this->db->fetchOne("SELECT academic_year_id FROM classes WHERE id = ? AND school_id = ?", [$data['class_id'], $schoolId]);
        if (!$class) {
            Response::validationError(['class_id' => ['الصف المحدد غير موجود في هذه المدرسة']]);
        }

        return $this->db->transaction(function(Database $db) use ($schoolId, $class, $data) {
            // 1. Create User
            $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
            
            $userId = $db->insert('users', [
                'name'          => $data['name'],
                'email'         => $data['email'] ?? null,
                'password_hash' => $passwordHash,
                'role'          => 'student',
                'is_active'     => 1
            ]);

            // 2. Create Student
            $studentId = $db->insert('students', [
                'user_id'          => $userId,
                'school_id'        => $schoolId,
                'class_id'         => $data['class_id'],
                'academic_year_id' => $class['academic_year_id'],
                'student_code'     => $data['student_code'],
                'date_of_birth'    => $data['date_of_birth'] ?? null,
                'gender'           => $data['gender'] ?? null,
                'parent_phone'     => $data['parent_phone'],
                'address'          => $data['address'] ?? null,
                'enrolled_at'      => date('Y-m-d')
            ]);

            // 3. Optional: Link or Create Parent Account
            // Based on parent_phone
            $parentUser = $db->fetchOne("SELECT id FROM users WHERE phone = ? AND role = 'parent'", [$data['parent_phone']]);
            if (!$parentUser) {
                // We create a skeleton parent user so they can login later, default password same as phone
                $parentPassHash = password_hash($data['parent_phone'], PASSWORD_BCRYPT, ['cost' => 12]);
                $parentUserId = $db->insert('users', [
                    'name'          => 'ولي أمر الطالب ' . $data['name'],
                    'phone'         => $data['parent_phone'],
                    'password_hash' => $parentPassHash,
                    'role'          => 'parent'
                ]);

                $db->insert('parents', [
                    'user_id' => $parentUserId,
                    'phone'   => $data['parent_phone']
                ]);
            }

            return $this->getById($schoolId, $studentId);
        });
    }

    public function update(int $schoolId, int $id, array $data): array
    {
        $student = $this->getById($schoolId, $id);

        if (!empty($data['student_code']) && $data['student_code'] !== $student['student_code']) {
            $exists = $this->db->fetchOne("SELECT id FROM students WHERE student_code = ? AND id != ?", [$data['student_code'], $id]);
            if ($exists) {
                Response::validationError(['student_code' => ['الرقم الأكاديمي مستخدم بالفعل']]);
            }
        }

        $this->db->transaction(function(Database $db) use ($student, $data, $id) {
            // Update user part
            $userUpdate = [];
            if (isset($data['name'])) $userUpdate['name'] = $data['name'];
            if (isset($data['email'])) $userUpdate['email'] = $data['email'];
            if (isset($data['is_active'])) $userUpdate['is_active'] = $data['is_active'];
            if (!empty($data['password'])) {
                $userUpdate['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
            }

            if (!empty($userUpdate)) {
                $db->update('users', $userUpdate, ['id' => $student['user_id']]);
            }

            // Update student part
            $studentUpdate = [];
            $fillable = ['class_id', 'student_code', 'date_of_birth', 'gender', 'parent_phone', 'address', 'status'];
            
            foreach ($fillable as $field) {
                if (array_key_exists($field, $data)) {
                    $studentUpdate[$field] = $data[$field];
                }
            }

            if (!empty($studentUpdate)) {
                $db->update('students', $studentUpdate, ['id' => $id]);
            }
        });

        return $this->getById($schoolId, $id);
    }
}
