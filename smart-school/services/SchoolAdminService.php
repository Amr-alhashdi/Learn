<?php
// services/SchoolAdminService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;
use Core\FileUpload;

class SchoolAdminService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getSchoolInfo(int $schoolId): array
    {
        $school = $this->db->fetchOne("SELECT * FROM schools WHERE id = ?", [$schoolId]);
        if (!$school) {
            Response::notFound('المدرسة غير موجودة');
        }
        return $school;
    }

    public function updateSchoolInfo(int $schoolId, array $data): array
    {
        $this->getSchoolInfo($schoolId); // ensure it exists

        $updateData = [];
        $fillable = ['name', 'name_en', 'address', 'city', 'phone', 'email', 'website', 'settings'];
        
        foreach ($fillable as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
            }
        }

        if (!empty($updateData)) {
            $this->db->update('schools', $updateData, ['id' => $schoolId]);
        }

        return $this->getSchoolInfo($schoolId);
    }

    public function updateLogo(int $schoolId, array $file): array
    {
        $school = $this->getSchoolInfo($schoolId);

        $uploader = new FileUpload();
        
        // Remove old logo if exists
        if (!empty($school['logo'])) {
            $uploader->delete($school['logo']);
        }

        $logoUrl = $uploader->upload($file, 'avatars'); // saving to avatars or new logos dir

        $this->db->update('schools', ['logo' => $logoUrl], ['id' => $schoolId]);
        
        return $this->getSchoolInfo($schoolId);
    }
}
