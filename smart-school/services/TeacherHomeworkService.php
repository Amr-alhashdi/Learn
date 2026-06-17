<?php
// services/TeacherHomeworkService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;
use Core\FileUpload;
use Core\Request;

class TeacherHomeworkService
{
    private Database $db;
    private FileUpload $uploader;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->uploader = new FileUpload();
    }

    private function getTeacherId(int $userId): int
    {
        $teacher = $this->db->fetchOne("SELECT id FROM teachers WHERE user_id = ?", [$userId]);
        if (!$teacher) Response::forbidden('بيانات المعلم غير مكتملة');
        return $teacher['id'];
    }

    public function getAll(int $userId, int $classId, int $subjectId, int $page = 1, int $perPage = 20): array
    {
        $teacherId = $this->getTeacherId($userId);

        $valid = $this->db->fetchOne(
            "SELECT school_id FROM teacher_assignments WHERE teacher_id = ? AND class_id = ? AND subject_id = ? LIMIT 1",
            [$teacherId, $classId, $subjectId]
        );
        if (!$valid) Response::forbidden('ليس لديك صلاحية على هذا الصف أو المادة');

        $sql = "SELECT id, title, description, file_path, due_date, created_at 
                FROM assignments 
                WHERE teacher_id = ? AND class_id = ? AND subject_id = ?
                ORDER BY created_at DESC";
                
        return $this->db->paginate($sql, [$teacherId, $classId, $subjectId], $page, $perPage);
    }

    public function create(int $userId, array $data, ?array $file): array
    {
        $teacherId = $this->getTeacherId($userId);

        $assignment = $this->db->fetchOne(
            "SELECT school_id FROM teacher_assignments WHERE teacher_id = ? AND class_id = ? AND subject_id = ? LIMIT 1",
            [$teacherId, $data['class_id'], $data['subject_id']]
        );
        if (!$assignment) Response::forbidden('ليس لديك صلاحية على هذا الصف أو المادة');

        $filePath = null;
        if ($file && $file['error'] !== UPLOAD_ERR_NO_FILE) {
            $dirPath = "homework/{$assignment['school_id']}/{$data['subject_id']}";
            $filePath = $this->uploader->upload($file, $dirPath);
        }

        $id = $this->db->insert('assignments', [
            'class_id'    => $data['class_id'],
            'subject_id'  => $data['subject_id'],
            'teacher_id'  => $teacherId,
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'file_path'   => $filePath,
            'due_date'    => $data['due_date']
        ]);

        return $this->db->fetchOne("SELECT * FROM assignments WHERE id = ?", [$id]);
    }

    public function delete(int $userId, int $id): void
    {
        $teacherId = $this->getTeacherId($userId);
        
        $homework = $this->db->fetchOne("SELECT file_path, teacher_id FROM assignments WHERE id = ?", [$id]);
        if (!$homework || $homework['teacher_id'] != $teacherId) {
            Response::notFound('الواجب غير موجود أو لا تملك صلاحية حذفه');
        }

        if ($homework['file_path']) {
            $this->uploader->delete($homework['file_path']);
        }

        $this->db->delete('assignments', ['id' => $id]);
    }
}
