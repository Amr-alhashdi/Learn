<?php
// services/SchoolReportService.php

declare(strict_types=1);

namespace Services;

use Core\Database;

class SchoolReportService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getOverview(int $schoolId): array
    {
        $stats = [];
        
        $stats['total_students'] = $this->db->count("SELECT COUNT(*) FROM students WHERE school_id = ? AND status = 'active'", [$schoolId]);
        
        $stats['total_teachers'] = $this->db->count("SELECT COUNT(DISTINCT teacher_id) FROM teacher_assignments WHERE school_id = ?", [$schoolId]);
        
        $stats['total_classes'] = $this->db->count("SELECT COUNT(*) FROM classes WHERE school_id = ?", [$schoolId]);
        
        // Basic today attendance rate
        $today = date('Y-m-d');
        $totalAttendance = $this->db->count("SELECT COUNT(*) FROM attendance a JOIN classes c ON a.class_id = c.id WHERE c.school_id = ? AND a.date = ?", [$schoolId, $today]);
        $present = $this->db->count("SELECT COUNT(*) FROM attendance a JOIN classes c ON a.class_id = c.id WHERE c.school_id = ? AND a.date = ? AND a.status = 'present'", [$schoolId, $today]);
        
        $stats['today_attendance_rate'] = $totalAttendance > 0 ? round(($present / $totalAttendance) * 100, 1) : null;

        return $stats;
    }
}
