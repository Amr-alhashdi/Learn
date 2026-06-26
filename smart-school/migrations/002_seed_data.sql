-- Seed data for testing the system

-- 1. Ensure a school exists
INSERT INTO `schools` (`id`, `name`, `city`, `status`) 
VALUES (1, 'مدرسة النهضة الحديثة', 'صنعاء', 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 2. Ensure an academic year exists
INSERT INTO `academic_years` (`id`, `school_id`, `name`, `start_date`, `end_date`, `is_current`)
VALUES (1, 1, '2024-2025', '2024-09-01', '2025-06-30', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. Ensure a grade level exists
INSERT INTO `grade_levels` (`id`, `school_id`, `name`, `order_num`)
VALUES (1, 1, 'الصف التاسع', 9)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 4. Ensure a class exists
INSERT INTO `classes` (`id`, `school_id`, `grade_level_id`, `academic_year_id`, `name`, `capacity`)
VALUES (1, 1, 1, 1, 'أ', 30)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 5. Add Users
-- Password for all: password (hashed with bcrypt)
-- HASH: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- Super Admin
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `is_active`)
VALUES (1, 'المدير العام', 'admin@smartschool.com', '$2y$10$9r5qeJaTbZDRlr69JggWz.Cu0hCmTij4jsWENBkKKGmztO0ucrDTC', 'super_admin', 1)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- School Admin
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `is_active`)
VALUES (2, 'مدير المدرسة', 'school@test.com', '$2y$10$9r5qeJaTbZDRlr69JggWz.Cu0hCmTij4jsWENBkKKGmztO0ucrDTC', 'school_admin', 1)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

INSERT INTO `school_admins` (`user_id`, `school_id`)
VALUES (2, 1)
ON DUPLICATE KEY UPDATE `school_id` = VALUES(`school_id`);

-- Teacher
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `is_active`)
VALUES (3, 'الأستاذ خالد', 'teacher@test.com', '$2y$10$9r5qeJaTbZDRlr69JggWz.Cu0hCmTij4jsWENBkKKGmztO0ucrDTC', 'teacher', 1)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

INSERT INTO `teachers` (`user_id`, `specialization`)
VALUES (3, 'الرياضيات')
ON DUPLICATE KEY UPDATE `specialization` = VALUES(`specialization`);

-- Student
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `is_active`)
VALUES (4, 'محمد علي', 'student@test.com', '$2y$10$9r5qeJaTbZDRlr69JggWz.Cu0hCmTij4jsWENBkKKGmztO0ucrDTC', 'student', 1)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

INSERT INTO `students` (`user_id`, `school_id`, `class_id`, `academic_year_id`, `student_code`, `parent_phone`)
VALUES (4, 1, 1, 1, 'S-1001', '777000000')
ON DUPLICATE KEY UPDATE `student_code` = VALUES(`student_code`);
