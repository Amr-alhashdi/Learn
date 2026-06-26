<?php
// services/ClassService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class ClassService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    // -------------------------------------------------------
    // Grade Levels Management
    // -------------------------------------------------------
    public function getGrades(?int $schoolId): array
    {
        if ($schoolId === null) {
            return $this->db->fetchAll("SELECT * FROM grade_levels ORDER BY school_id, order_num ASC");
        }
        return $this->db->fetchAll("SELECT * FROM grade_levels WHERE school_id = ? ORDER BY order_num ASC", [$schoolId]);
    }

    public function createGrade(array $data): array
    {
        $id = $this->db->insert('grade_levels', [
            'school_id' => $data['school_id'],
            'name'      => $data['name'],
            'order_num' => $data['order_num'] ?? 0
        ]);

        return $this->db->fetchOne("SELECT * FROM grade_levels WHERE id = ?", [$id]);
    }

    public function deleteGrade(int $id): void
    {
        $this->db->delete('grade_levels', ['id' => $id]);
    }

    // -------------------------------------------------------
    // Classes Management
    // -------------------------------------------------------
    public function getClasses(int $schoolId, ?int $gradeId = null): array
    {
        $params = [$schoolId];
        $where = "c.school_id = ?";
        
        if ($gradeId) {
            $where .= " AND c.grade_level_id = ?";
            $params[] = $gradeId;
        }

        $sql = "SELECT c.*, g.name as grade_name 
                FROM classes c 
                JOIN grade_levels g ON c.grade_level_id = g.id 
                WHERE {$where} 
                ORDER BY g.order_num ASC, c.name ASC";

        return $this->db->fetchAll($sql, $params);
    }

    public function createClass(array $data): array
    {
        // verify grade belongs to school
        $grade = $this->db->fetchOne("SELECT school_id FROM grade_levels WHERE id = ?", [$data['grade_level_id']]);
        if (!$grade || $grade['school_id'] != $data['school_id']) {
            Response::validationError(['grade_level_id' => ['المرحلة الدراسية غير تابعة لهذه المدرسة']]);
        }

        // We assume academic_year_id is passed, or we find current year
        if (empty($data['academic_year_id'])) {
            $year = $this->db->fetchOne("SELECT id FROM academic_years WHERE school_id = ? AND is_current = 1", [$data['school_id']]);
            if (!$year) {
                Response::error('لا يوجد سنة دراسية مفعلة حالياً في هذه المدرسة', 400);
            }
            $data['academic_year_id'] = $year['id'];
        }

        $id = $this->db->insert('classes', [
            'school_id'        => $data['school_id'],
            'grade_level_id'   => $data['grade_level_id'],
            'academic_year_id' => $data['academic_year_id'],
            'name'             => $data['name'],
            'capacity'         => $data['capacity'] ?? 40
        ]);

        return $this->db->fetchOne("SELECT * FROM classes WHERE id = ?", [$id]);
    }

    public function updateClass(int $id, array $data): array
    {
        $updateData = [];
        if (isset($data['name'])) $updateData['name'] = $data['name'];
        if (isset($data['capacity'])) $updateData['capacity'] = $data['capacity'];

        if (!empty($updateData)) {
            $this->db->update('classes', $updateData, ['id' => $id]);
        }

        return $this->db->fetchOne("SELECT * FROM classes WHERE id = ?", [$id]);
    }

    public function deleteClass(int $id): void
    {
        $this->db->delete('classes', ['id' => $id]);
    }
}
