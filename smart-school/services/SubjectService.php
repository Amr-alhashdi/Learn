<?php
// services/SubjectService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class SubjectService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getAll(int $schoolId, int $page = 1, int $perPage = 20): array
    {
        $sql = "SELECT * FROM subjects WHERE school_id = ? ORDER BY id DESC";
        return $this->db->paginate($sql, [$schoolId], $page, $perPage);
    }

    public function getById(int $id): array
    {
        $subject = $this->db->fetchOne("SELECT * FROM subjects WHERE id = ?", [$id]);
        if (!$subject) {
            Response::notFound('المادة الدراسية غير موجودة');
        }
        return $subject;
    }

    public function create(array $data): array
    {
        // verify school exists
        $school = $this->db->fetchOne("SELECT id FROM schools WHERE id = ?", [$data['school_id']]);
        if (!$school) {
            Response::validationError(['school_id' => ['المدرسة المحددة غير موجودة']]);
        }

        $id = $this->db->insert('subjects', [
            'school_id'   => $data['school_id'],
            'name'        => $data['name'],
            'name_en'     => $data['name_en'] ?? null,
            'code'        => $data['code'] ?? null,
            'description' => $data['description'] ?? null,
            'icon'        => $data['icon'] ?? null,
            'color'       => $data['color'] ?? null
        ]);

        return $this->getById($id);
    }

    public function update(int $id, array $data): array
    {
        $subject = $this->getById($id);

        $updateData = [];
        $fillable = ['name', 'name_en', 'code', 'description', 'icon', 'color'];
        
        foreach ($fillable as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
            }
        }

        if (!empty($updateData)) {
            $this->db->update('subjects', $updateData, ['id' => $id]);
        }

        return $this->getById($id);
    }

    public function delete(int $id): void
    {
        $this->getById($id);
        $this->db->delete('subjects', ['id' => $id]);
    }
}
