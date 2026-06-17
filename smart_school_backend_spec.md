# 🏫 نظام إدارة المدارس الذكي — المواصفات التقنية الكاملة للـ Backend

> **Tech Stack:** PHP 8 Native · MySQL 8 · REST API · Python AI Service  
> **Architecture:** Multi-School Centralized System · RBAC Permissions · JWT Auth  
> **الإصدار:** v1.0 — وثيقة تقنية لفريق التطوير

---

## 📋 فهرس المحتويات

1. [نظرة عامة على المشروع](#1-نظرة-عامة-على-المشروع)
2. [هيكل المجلدات](#2-هيكل-المجلدات)
3. [تصميم قاعدة البيانات](#3-تصميم-قاعدة-البيانات)
4. [نظام المصادقة والصلاحيات (RBAC)](#4-نظام-المصادقة-والصلاحيات-rbac)
5. [API Endpoints — الطالب](#5-api-endpoints--الطالب)
6. [API Endpoints — ولي الأمر](#6-api-endpoints--ولي-الأمر)
7. [API Endpoints — المعلم](#7-api-endpoints--المعلم)
8. [API Endpoints — مدير المدرسة](#8-api-endpoints--مدير-المدرسة)
9. [API Endpoints — مدير النظام](#9-api-endpoints--مدير-النظام)
10. [نظام الذكاء الاصطناعي](#10-نظام-الذكاء-الاصطناعي)
11. [نظام الإشعارات](#11-نظام-الإشعارات)
12. [نظام إدارة الملفات](#12-نظام-إدارة-الملفات)
13. [قواعد الأمان](#13-قواعد-الأمان)
14. [خارطة العمل لفريق التطوير](#14-خارطة-العمل-لفريق-التطوير)

---

## 1. نظرة عامة على المشروع

### الوصف العام
نظام إدارة مدارس ذكي ومركزي يخدم **عدة مدارس** ضمن منصة واحدة. يعتمد على:
- **Backend:** PHP 8 خام (Native) بدون Framework
- **Database:** MySQL 8
- **Auth:** JWT (JSON Web Tokens) + Refresh Tokens
- **AI:** Python Microservice منفصلة تتصل بـ Backend عبر REST API داخلي
- **Notifications:** Firebase Cloud Messaging (FCM)
- **Files:** Local Storage Server مع خيار الترقية لـ Object Storage

### مبدأ التصميم الأساسي
```
كل شيء مرتبط بـ school_id
المادة → الصف → المدرسة
المعلم → المدرسة (يمكن للمعلم أن يكون في عدة مدارس)
الطالب → المدرسة (طالب واحد في مدرسة واحدة)
ولي الأمر → مرتبط بعدة أبناء عبر رقم الهاتف (phone_number)
```

---

## 2. هيكل المجلدات

```
smart-school-backend/
│
├── api/                          # نقاط الدخول الرئيسية للـ API
│   ├── auth/
│   │   ├── login.php
│   │   ├── logout.php
│   │   └── refresh.php
│   ├── student/
│   │   ├── dashboard.php         # التحليل الذكي
│   │   ├── assignments.php       # الواجبات
│   │   ├── subjects.php          # المواد
│   │   ├── exams.php             # الاختبارات
│   │   ├── notifications.php     # الإشعارات
│   │   └── profile.php           # الملف الشخصي
│   ├── parent/
│   │   ├── children.php          # الأبناء
│   │   ├── reports.php           # التقارير
│   │   ├── notifications.php
│   │   └── profile.php
│   ├── teacher/
│   │   ├── schools.php           # المدارس والفصول
│   │   ├── attendance.php        # الحضور اليومي
│   │   ├── grades.php            # الدرجات
│   │   ├── content.php           # المحتوى التعليمي
│   │   ├── notifications.php
│   │   └── profile.php
│   ├── school-admin/
│   │   ├── school.php            # بيانات المدرسة
│   │   ├── classes.php           # الصفوف
│   │   ├── students.php          # الطلاب
│   │   ├── teachers.php          # المعلمون
│   │   ├── attendance.php        # الحضور
│   │   ├── grades.php            # الدرجات
│   │   ├── reports.php           # التقارير الذكية
│   │   └── notifications.php
│   └── super-admin/
│       ├── schools.php
│       ├── users.php
│       ├── subjects.php
│       ├── content.php
│       ├── ai.php
│       └── system.php
│
├── core/                         # المكتبات الأساسية
│   ├── Database.php              # Singleton DB Connection
│   ├── Router.php                # HTTP Router
│   ├── Request.php               # Request Handler
│   ├── Response.php              # JSON Response Helper
│   ├── Auth.php                  # JWT Auth Middleware
│   ├── Middleware.php            # Middleware Chain
│   ├── Validator.php             # Input Validation
│   └── FileUpload.php            # File Manager
│
├── models/                       # Database Models
│   ├── User.php
│   ├── School.php
│   ├── Student.php
│   ├── Teacher.php
│   ├── Parent.php
│   ├── Class.php
│   ├── Subject.php
│   ├── Attendance.php
│   ├── Grade.php
│   ├── Assignment.php
│   ├── Exam.php
│   ├── Notification.php
│   └── Content.php
│
├── services/                     # Business Logic
│   ├── AuthService.php
│   ├── AIService.php             # التواصل مع Python AI
│   ├── NotificationService.php
│   ├── GradeService.php
│   ├── AttendanceService.php
│   └── ReportService.php
│
├── middleware/
│   ├── AuthMiddleware.php        # التحقق من JWT
│   ├── RoleMiddleware.php        # RBAC
│   └── RateLimitMiddleware.php
│
├── config/
│   ├── database.php
│   ├── jwt.php
│   ├── ai.php
│   ├── fcm.php
│   └── app.php
│
├── storage/
│   ├── uploads/
│   │   ├── curricula/            # المقررات
│   │   ├── summaries/            # الملخصات
│   │   ├── references/           # المراجع
│   │   ├── presentations/        # العروض التقديمية
│   │   └── avatars/              # الصور الشخصية
│   └── logs/
│
├── migrations/                   # SQL Migration Files
│   ├── 001_create_schools.sql
│   ├── 002_create_users.sql
│   ├── ... (ملف لكل جدول)
│   └── 020_create_indexes.sql
│
├── .htaccess                     # URL Rewriting
└── index.php                     # Entry Point
```

---

## 3. تصميم قاعدة البيانات

> ⚠️ **ملاحظة حيوية:** هذا القسم هو قلب المشروع. 70% من نجاح النظام يعتمد على صحة العلاقات هنا.

---

### 3.1 جدول `schools` — المدارس

```sql
CREATE TABLE schools (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    name_en         VARCHAR(200),
    logo            VARCHAR(500),
    address         TEXT,
    city            VARCHAR(100),
    country         VARCHAR(100) DEFAULT 'YE',
    phone           VARCHAR(30),
    email           VARCHAR(150) UNIQUE,
    website         VARCHAR(300),
    founded_year    YEAR,
    status          ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    settings        JSON,               -- إعدادات خاصة بكل مدرسة
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.2 جدول `users` — جميع المستخدمين

```sql
CREATE TABLE users (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) UNIQUE,
    phone           VARCHAR(30),
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('super_admin','school_admin','teacher','student','parent') NOT NULL,
    avatar          VARCHAR(500),
    fcm_token       VARCHAR(500),        -- Firebase Cloud Messaging Token
    is_active       TINYINT(1) DEFAULT 1,
    last_login      TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_role (role),
    INDEX idx_phone (phone),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.3 جدول `school_admins` — مدراء المدارس

```sql
CREATE TABLE school_admins (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    school_id   INT UNSIGNED NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_admin_school (user_id, school_id),
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

### 3.4 جدول `academic_years` — السنوات الدراسية

```sql
CREATE TABLE academic_years (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_id   INT UNSIGNED NOT NULL,
    name        VARCHAR(50) NOT NULL,   -- مثال: 2024-2025
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    is_current  TINYINT(1) DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    INDEX idx_school_year (school_id, is_current)
) ENGINE=InnoDB;
```

---

### 3.5 جدول `grade_levels` — المراحل الدراسية

```sql
CREATE TABLE grade_levels (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_id   INT UNSIGNED NOT NULL,
    name        VARCHAR(100) NOT NULL,  -- مثال: الصف الأول، الصف السابع
    order_num   TINYINT UNSIGNED,       -- للترتيب
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

### 3.6 جدول `classes` — الفصول الدراسية (الشعب)

```sql
CREATE TABLE classes (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_id        INT UNSIGNED NOT NULL,
    grade_level_id   INT UNSIGNED NOT NULL,
    academic_year_id INT UNSIGNED NOT NULL,
    name             VARCHAR(50) NOT NULL,  -- مثال: أ، ب، ج
    capacity         TINYINT UNSIGNED DEFAULT 40,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (school_id)        REFERENCES schools(id)        ON DELETE CASCADE,
    FOREIGN KEY (grade_level_id)   REFERENCES grade_levels(id)   ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    INDEX idx_school_grade (school_id, grade_level_id)
) ENGINE=InnoDB;
```

---

### 3.7 جدول `subjects` — المواد الدراسية

```sql
CREATE TABLE subjects (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_id   INT UNSIGNED NOT NULL,
    name        VARCHAR(150) NOT NULL,
    name_en     VARCHAR(150),
    code        VARCHAR(20),             -- رمز المادة
    description TEXT,
    icon        VARCHAR(100),
    color       VARCHAR(10),             -- لون المادة في الواجهة
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

### 3.8 جدول `class_subjects` — ربط المادة بالصف

```sql
CREATE TABLE class_subjects (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_id         INT UNSIGNED NOT NULL,
    subject_id       INT UNSIGNED NOT NULL,
    academic_year_id INT UNSIGNED NOT NULL,
    weekly_hours     TINYINT UNSIGNED DEFAULT 4,

    UNIQUE KEY uq_class_subject (class_id, subject_id, academic_year_id),
    FOREIGN KEY (class_id)         REFERENCES classes(id)        ON DELETE CASCADE,
    FOREIGN KEY (subject_id)       REFERENCES subjects(id)       ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

### 3.9 جدول `students` — الطلاب

```sql
CREATE TABLE students (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id          INT UNSIGNED NOT NULL UNIQUE,
    school_id        INT UNSIGNED NOT NULL,
    class_id         INT UNSIGNED NOT NULL,
    academic_year_id INT UNSIGNED NOT NULL,
    student_code     VARCHAR(30) UNIQUE NOT NULL,  -- الرقم الأكاديمي
    date_of_birth    DATE,
    gender           ENUM('male', 'female'),
    parent_phone     VARCHAR(30) NOT NULL,          -- رابط ولي الأمر
    address          TEXT,
    enrolled_at      DATE,
    status           ENUM('active','suspended','transferred','graduated') DEFAULT 'active',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)          REFERENCES users(id)          ON DELETE CASCADE,
    FOREIGN KEY (school_id)        REFERENCES schools(id)        ON DELETE CASCADE,
    FOREIGN KEY (class_id)         REFERENCES classes(id)        ON DELETE RESTRICT,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE RESTRICT,
    INDEX idx_parent_phone (parent_phone),
    INDEX idx_school_class (school_id, class_id)
) ENGINE=InnoDB;
```

---

### 3.10 جدول `parents` — أولياء الأمور

```sql
CREATE TABLE parents (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL UNIQUE,
    phone       VARCHAR(30) NOT NULL UNIQUE,  -- المفتاح الرئيسي للربط
    national_id VARCHAR(30),
    occupation  VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_phone (phone)
) ENGINE=InnoDB;

-- الربط يتم عبر:
-- parents.phone = students.parent_phone  (تلقائي)
```

---

### 3.11 جدول `teachers` — المعلمون

```sql
CREATE TABLE teachers (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL UNIQUE,
    specialization  VARCHAR(150),        -- التخصص الأكاديمي
    qualification   VARCHAR(150),        -- المؤهل العلمي
    hire_date       DATE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

### 3.12 جدول `teacher_assignments` — تعيين المعلم لمدرسة + مادة + صف

```sql
CREATE TABLE teacher_assignments (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    teacher_id       INT UNSIGNED NOT NULL,
    school_id        INT UNSIGNED NOT NULL,
    class_id         INT UNSIGNED NOT NULL,
    subject_id       INT UNSIGNED NOT NULL,
    academic_year_id INT UNSIGNED NOT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_teacher_class_subject (teacher_id, class_id, subject_id, academic_year_id),
    FOREIGN KEY (teacher_id)       REFERENCES teachers(id)       ON DELETE CASCADE,
    FOREIGN KEY (school_id)        REFERENCES schools(id)        ON DELETE CASCADE,
    FOREIGN KEY (class_id)         REFERENCES classes(id)        ON DELETE CASCADE,
    FOREIGN KEY (subject_id)       REFERENCES subjects(id)       ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

### 3.13 جدول `attendance` — الحضور اليومي

```sql
CREATE TABLE attendance (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id       INT UNSIGNED NOT NULL,
    class_id         INT UNSIGNED NOT NULL,
    subject_id       INT UNSIGNED,       -- NULL = حضور عام لليوم
    teacher_id       INT UNSIGNED NOT NULL,
    academic_year_id INT UNSIGNED NOT NULL,
    date             DATE NOT NULL,
    status           ENUM('present','absent','late','excused') NOT NULL,
    note             VARCHAR(500),
    approval_status  ENUM('pending','approved','rejected') DEFAULT 'pending',
    approved_by      INT UNSIGNED,       -- school_admin user_id
    approved_at      TIMESTAMP NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_attendance (student_id, date, subject_id),
    FOREIGN KEY (student_id)  REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id)  REFERENCES teachers(id) ON DELETE RESTRICT,
    INDEX idx_date_class (date, class_id),
    INDEX idx_student_date (student_id, date)
) ENGINE=InnoDB;
```

---

### 3.14 جدول `grade_types` — أنواع الدرجات

```sql
CREATE TABLE grade_types (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_id   INT UNSIGNED NOT NULL,
    name        VARCHAR(100) NOT NULL,  -- مثال: اختبار شهري، واجب، مشاركة، سلوك
    max_score   DECIMAL(5,2) NOT NULL,
    weight      DECIMAL(4,2) DEFAULT 1.00,  -- الوزن النسبي
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

### 3.15 جدول `grades` — الدرجات

```sql
CREATE TABLE grades (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id       INT UNSIGNED NOT NULL,
    teacher_id       INT UNSIGNED NOT NULL,
    subject_id       INT UNSIGNED NOT NULL,
    class_id         INT UNSIGNED NOT NULL,
    academic_year_id INT UNSIGNED NOT NULL,
    grade_type_id    INT UNSIGNED NOT NULL,
    score            DECIMAL(6,2) NOT NULL,
    max_score        DECIMAL(6,2) NOT NULL,
    term             TINYINT DEFAULT 1,        -- الفصل الدراسي 1 أو 2
    note             TEXT,
    approval_status  ENUM('pending','approved','rejected') DEFAULT 'pending',
    approved_by      INT UNSIGNED NULL,
    approved_at      TIMESTAMP NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)       REFERENCES students(id)    ON DELETE CASCADE,
    FOREIGN KEY (teacher_id)       REFERENCES teachers(id)    ON DELETE RESTRICT,
    FOREIGN KEY (subject_id)       REFERENCES subjects(id)    ON DELETE RESTRICT,
    FOREIGN KEY (grade_type_id)    REFERENCES grade_types(id) ON DELETE RESTRICT,
    INDEX idx_student_subject (student_id, subject_id, academic_year_id),
    INDEX idx_approval (approval_status)
) ENGINE=InnoDB;
```

---

### 3.16 جدول `assignments` — الواجبات والتكاليف

```sql
CREATE TABLE assignments (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    teacher_id       INT UNSIGNED NOT NULL,
    class_id         INT UNSIGNED NOT NULL,
    subject_id       INT UNSIGNED NOT NULL,
    academic_year_id INT UNSIGNED NOT NULL,
    title            VARCHAR(300) NOT NULL,
    description      TEXT,
    type             ENUM('homework','project','research','activity') DEFAULT 'homework',
    due_date         DATE NOT NULL,
    max_score        DECIMAL(6,2),
    attachment       VARCHAR(500),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (teacher_id)  REFERENCES teachers(id)  ON DELETE CASCADE,
    FOREIGN KEY (class_id)    REFERENCES classes(id)   ON DELETE CASCADE,
    FOREIGN KEY (subject_id)  REFERENCES subjects(id)  ON DELETE CASCADE,
    INDEX idx_class_due (class_id, due_date)
) ENGINE=InnoDB;
```

---

### 3.17 جدول `assignment_submissions` — تسليم الواجبات

```sql
CREATE TABLE assignment_submissions (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    assignment_id   INT UNSIGNED NOT NULL,
    student_id      INT UNSIGNED NOT NULL,
    submission_file VARCHAR(500),
    note            TEXT,
    score           DECIMAL(6,2),
    status          ENUM('pending','submitted','graded','late') DEFAULT 'pending',
    submitted_at    TIMESTAMP NULL,
    graded_at       TIMESTAMP NULL,

    UNIQUE KEY uq_submission (assignment_id, student_id),
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id)    REFERENCES students(id)    ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

### 3.18 جدول `educational_content` — المحتوى التعليمي

```sql
CREATE TABLE educational_content (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subject_id  INT UNSIGNED NOT NULL,
    school_id   INT UNSIGNED NOT NULL,
    title       VARCHAR(300) NOT NULL,
    description TEXT,
    type        ENUM('curriculum','summary','reference','book','presentation','video','other') NOT NULL,
    file_path   VARCHAR(500),
    file_size   INT UNSIGNED,            -- بالبايت
    mime_type   VARCHAR(100),
    target_role ENUM('student','teacher','both') DEFAULT 'both',
    uploaded_by INT UNSIGNED NOT NULL,   -- user_id
    is_active   TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (subject_id) REFERENCES subjects(id)  ON DELETE CASCADE,
    FOREIGN KEY (school_id)  REFERENCES schools(id)   ON DELETE CASCADE,
    INDEX idx_subject_type (subject_id, type)
) ENGINE=InnoDB;
```

---

### 3.19 جدول `exams` — الاختبارات الإلكترونية

```sql
CREATE TABLE exams (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subject_id  INT UNSIGNED NOT NULL,
    class_id    INT UNSIGNED NOT NULL,
    title       VARCHAR(300) NOT NULL,
    scope       ENUM('topic','unit','term','full_book') NOT NULL,
    scope_ref   VARCHAR(200),           -- اسم الموضوع أو الوحدة
    duration    SMALLINT UNSIGNED,      -- بالدقائق
    created_by  INT UNSIGNED NOT NULL,  -- user_id (super_admin أو AI)
    is_ai       TINYINT(1) DEFAULT 0,  -- هل أنشأه الذكاء الاصطناعي
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id)   REFERENCES classes(id)  ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

### 3.20 جدول `exam_questions` — أسئلة الاختبارات

```sql
CREATE TABLE exam_questions (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    exam_id     INT UNSIGNED NOT NULL,
    question    TEXT NOT NULL,
    type        ENUM('mcq','true_false','short_answer','essay') NOT NULL,
    options     JSON,                   -- للـ MCQ: ["خيار أ","خيار ب","خيار ج","خيار د"]
    answer      TEXT NOT NULL,          -- الإجابة الصحيحة
    score       DECIMAL(4,2) DEFAULT 1,
    order_num   SMALLINT UNSIGNED,

    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

### 3.21 جدول `exam_attempts` — محاولات الطلاب في الاختبارات

```sql
CREATE TABLE exam_attempts (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    exam_id     INT UNSIGNED NOT NULL,
    student_id  INT UNSIGNED NOT NULL,
    started_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    total_score DECIMAL(6,2),
    max_score   DECIMAL(6,2),
    percentage  DECIMAL(5,2),
    ai_report   JSON,                   -- تقرير الذكاء الاصطناعي
    status      ENUM('in_progress','submitted','graded') DEFAULT 'in_progress',

    FOREIGN KEY (exam_id)    REFERENCES exams(id)    ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student_exam (student_id, exam_id)
) ENGINE=InnoDB;
```

---

### 3.22 جدول `exam_answers` — إجابات الطلاب

```sql
CREATE TABLE exam_answers (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attempt_id  INT UNSIGNED NOT NULL,
    question_id INT UNSIGNED NOT NULL,
    answer      TEXT,
    is_correct  TINYINT(1),
    score       DECIMAL(4,2) DEFAULT 0,
    ai_feedback TEXT,                   -- تغذية راجعة من الذكاء الاصطناعي

    UNIQUE KEY uq_attempt_question (attempt_id, question_id),
    FOREIGN KEY (attempt_id)  REFERENCES exam_attempts(id)  ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES exam_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

### 3.23 جدول `notifications` — الإشعارات

```sql
CREATE TABLE notifications (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,  -- المستقبِل
    school_id   INT UNSIGNED,
    title       VARCHAR(200) NOT NULL,
    body        TEXT NOT NULL,
    type        ENUM('absence','grade','assignment','ai_recommendation','system','announcement') NOT NULL,
    source      ENUM('school','teacher','ai','system') NOT NULL,
    ref_type    VARCHAR(50),            -- attendance, grade, exam...
    ref_id      INT UNSIGNED,           -- ID السجل المرتبط
    is_read     TINYINT(1) DEFAULT 0,
    sent_via    SET('in_app','fcm','sms'),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;
```

---

### 3.24 جدول `ai_analysis` — تحليلات الذكاء الاصطناعي

```sql
CREATE TABLE ai_analysis (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id      INT UNSIGNED NOT NULL,
    academic_year_id INT UNSIGNED NOT NULL,
    term            TINYINT DEFAULT 1,
    overall_score   DECIMAL(5,2),
    attendance_rate DECIMAL(5,2),
    strong_subjects JSON,               -- ["الرياضيات", "العلوم"]
    weak_subjects   JSON,               -- ["اللغة العربية"]
    recommendations JSON,               -- توصيات مفصلة
    risk_level      ENUM('low','medium','high') DEFAULT 'low',
    generated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_analysis   TIMESTAMP NULL,     -- موعد التحليل القادم

    FOREIGN KEY (student_id)       REFERENCES students(id)        ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)  ON DELETE CASCADE,
    INDEX idx_student_year (student_id, academic_year_id)
) ENGINE=InnoDB;
```

---

### 3.25 جدول `refresh_tokens` — JWT Refresh Tokens

```sql
CREATE TABLE refresh_tokens (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    token       VARCHAR(512) NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB;
```

---

### 3.26 جدول `audit_logs` — سجل العمليات

```sql
CREATE TABLE audit_logs (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED,
    school_id   INT UNSIGNED,
    action      VARCHAR(100) NOT NULL,    -- CREATE, UPDATE, DELETE, LOGIN
    table_name  VARCHAR(100),
    record_id   INT UNSIGNED,
    old_values  JSON,
    new_values  JSON,
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(300),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_action (user_id, action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;
```

---

### مخطط العلاقات (ERD مبسط)

```
schools ──── academic_years
   │               │
   ├── grade_levels │
   │       │        │
   │    classes ────┘
   │       │
   │   ┌───┴───────────────────┐
   │   │                       │
   │ students              class_subjects
   │   │                       │
   │ attendance              subjects
   │   │                       │
   │ grades               educational_content
   │
   ├── teachers
   │       │
   │   teacher_assignments
   │       │
   │   assignments
   │
   └── subjects
           │
         exams ── exam_questions ── exam_answers
                         │
                   exam_attempts
```

---

## 4. نظام المصادقة والصلاحيات (RBAC)

### 4.1 تدفق المصادقة

```
[Client] ──POST /api/auth/login──► [AuthService]
                                        │
                              التحقق من email/phone + password
                                        │
                              ┌─────────┴─────────┐
                           نجح                    فشل
                              │                    │
                    إنشاء JWT Access Token    401 Unauthorized
                    إنشاء Refresh Token
                              │
                    ◄── { access_token, refresh_token, user, role }
```

### 4.2 JWT Payload

```json
{
  "user_id": 123,
  "role": "teacher",
  "school_ids": [1, 3],
  "exp": 1700000000,
  "iat": 1699996400
}
```

### 4.3 جدول الصلاحيات (RBAC Matrix)

| العملية                    | student | parent | teacher | school_admin | super_admin |
|---------------------------|:-------:|:------:|:-------:|:------------:|:-----------:|
| عرض درجاته                |    ✅   |        |         |              |      ✅     |
| عرض درجات ابنه            |         |   ✅   |         |              |      ✅     |
| إدخال درجات               |         |        |    ✅   |      ✅      |      ✅     |
| اعتماد درجات              |         |        |         |      ✅      |      ✅     |
| تسجيل حضور               |         |        |    ✅   |      ✅      |      ✅     |
| اعتماد حضور              |         |        |         |      ✅      |      ✅     |
| إضافة طالب               |         |        |         |      ✅      |      ✅     |
| إضافة معلم               |         |        |         |      ✅      |      ✅     |
| إضافة مدرسة              |         |        |         |              |      ✅     |
| رفع محتوى تعليمي         |         |        |         |              |      ✅     |
| إرسال إشعارات            |         |        |    ✅   |      ✅      |      ✅     |
| تحليل الذكاء الاصطناعي   |    ✅   |   ✅   |    ✅   |      ✅      |      ✅     |
| إدارة إعدادات AI          |         |        |         |              |      ✅     |

---

## 5. API Endpoints — الطالب

**Base URL:** `/api/student/`  
**Auth:** Bearer Token (role: student)

---

### 5.1 لوحة التحليل الذكية

```
GET /api/student/dashboard
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "student": {
      "name": "أحمد محمد",
      "class": "الصف السابع - أ",
      "academic_year": "2024-2025"
    },
    "overall_gpa": 78.5,
    "attendance_rate": 91.2,
    "subjects_performance": [
      {
        "subject_id": 1,
        "subject_name": "الرياضيات",
        "average": 85.0,
        "status": "strong"
      },
      {
        "subject_id": 2,
        "subject_name": "اللغة العربية",
        "average": 62.0,
        "status": "weak"
      }
    ],
    "ai_analysis": {
      "risk_level": "medium",
      "strong_subjects": ["الرياضيات", "العلوم"],
      "weak_subjects": ["اللغة العربية", "التاريخ"],
      "recommendations": [
        "راجع وحدة النحو في مادة اللغة العربية",
        "خصص 30 دقيقة يومياً لمراجعة التاريخ"
      ],
      "generated_at": "2024-11-01T10:00:00Z"
    }
  }
}
```

---

### 5.2 الواجبات والتكاليف

```
GET /api/student/assignments?status=pending&subject_id=1
GET /api/student/assignments/{id}
POST /api/student/assignments/{id}/submit
```

**POST /submit Body:**
```json
{
  "note": "تم الحل",
  "attachment": "base64_encoded_file_or_null"
}
```

---

### 5.3 المواد الدراسية

```
GET /api/student/subjects
GET /api/student/subjects/{id}/content?type=curriculum
GET /api/student/subjects/{id}/content?type=summary
GET /api/student/subjects/{id}/content?type=reference
```

**Response لمحتوى المادة:**
```json
{
  "status": "success",
  "data": {
    "subject": { "id": 1, "name": "الرياضيات" },
    "content": [
      {
        "id": 10,
        "title": "كتاب الرياضيات الصف السابع",
        "type": "curriculum",
        "file_url": "/storage/uploads/curricula/math_g7.pdf",
        "file_size": "5.2 MB"
      }
    ]
  }
}
```

---

### 5.4 الاختبارات والتقييم

```
GET  /api/student/exams?subject_id=1&scope=unit
POST /api/student/exams/start          -- بدء اختبار جديد (AI يولده)
GET  /api/student/exams/{attempt_id}   -- عرض الاختبار الجاري
POST /api/student/exams/{attempt_id}/answer    -- إجابة سؤال
POST /api/student/exams/{attempt_id}/submit    -- تسليم الاختبار
GET  /api/student/exams/{attempt_id}/result    -- النتيجة والتقرير
```

**POST /exams/start Body:**
```json
{
  "subject_id": 1,
  "scope": "unit",
  "scope_ref": "الوحدة الثالثة - الكسور",
  "question_count": 20
}
```

**GET /exams/{id}/result Response:**
```json
{
  "status": "success",
  "data": {
    "score": 75.0,
    "max_score": 100.0,
    "percentage": 75.0,
    "passed": true,
    "ai_report": {
      "summary": "أداء جيد بشكل عام مع ضعف في الكسر التبسيط",
      "correct_topics": ["الجمع", "الطرح"],
      "weak_topics": ["التبسيط", "الضرب"],
      "recommendation": "راجع صفحات 45-52 في الكتاب المقرر"
    }
  }
}
```

---

### 5.5 الإشعارات

```
GET    /api/student/notifications?page=1&per_page=20
PATCH  /api/student/notifications/{id}/read
DELETE /api/student/notifications/{id}
POST   /api/student/notifications/read-all
```

---

### 5.6 الملف الشخصي

```
GET   /api/student/profile
PATCH /api/student/profile
POST  /api/student/profile/avatar
```

---

## 6. API Endpoints — ولي الأمر

**Base URL:** `/api/parent/`  
**Auth:** Bearer Token (role: parent)  
**الربط:** تلقائي عبر `parents.phone = students.parent_phone`

---

### 6.1 قائمة الأبناء

```
GET /api/parent/children
```

**Response:**
```json
{
  "data": [
    {
      "student_id": 5,
      "name": "أحمد محمد",
      "school": "مدرسة النور",
      "class": "الصف السابع أ",
      "gpa": 78.5,
      "attendance_rate": 91.0,
      "status": "active"
    },
    {
      "student_id": 8,
      "name": "سارة محمد",
      "school": "مدرسة الفجر",
      "class": "الصف الخامس ب",
      "gpa": 88.0,
      "attendance_rate": 97.0,
      "status": "active"
    }
  ]
}
```

---

### 6.2 تقرير ابن محدد

```
GET /api/parent/children/{student_id}/report
GET /api/parent/children/{student_id}/grades?term=1
GET /api/parent/children/{student_id}/attendance?month=11
GET /api/parent/children/{student_id}/assignments
GET /api/parent/children/{student_id}/ai-analysis
```

---

### 6.3 الإشعارات

```
GET   /api/parent/notifications
PATCH /api/parent/notifications/{id}/read
```

---

### 6.4 الملف الشخصي

```
GET   /api/parent/profile
PATCH /api/parent/profile
```

---

## 7. API Endpoints — المعلم

**Base URL:** `/api/teacher/`  
**Auth:** Bearer Token (role: teacher)

---

### 7.1 المدارس والفصول

```
GET /api/teacher/schools                              -- المدارس التي يعمل بها
GET /api/teacher/schools/{school_id}/classes          -- الفصول في مدرسة معينة
GET /api/teacher/schools/{school_id}/classes/{class_id}/subjects  -- المواد في الفصل
GET /api/teacher/schools/{school_id}/classes/{class_id}/students  -- قائمة الطلاب
```

---

### 7.2 الحضور اليومي

```
GET  /api/teacher/attendance?class_id=2&date=2024-11-01
POST /api/teacher/attendance           -- رفع كشف الحضور
PUT  /api/teacher/attendance/{id}      -- تعديل حضور طالب
```

**POST /attendance Body:**
```json
{
  "class_id": 2,
  "subject_id": 3,
  "date": "2024-11-01",
  "records": [
    { "student_id": 10, "status": "present", "note": null },
    { "student_id": 11, "status": "absent",  "note": "مريض" },
    { "student_id": 12, "status": "late",    "note": "تأخر 15 دقيقة" }
  ]
}
```

---

### 7.3 الدرجات

```
GET  /api/teacher/grades?class_id=2&subject_id=3&term=1
POST /api/teacher/grades            -- إدخال درجات
PUT  /api/teacher/grades/{id}       -- تعديل
GET  /api/teacher/grades/pending    -- الدرجات بانتظار الاعتماد
```

**POST /grades Body:**
```json
{
  "class_id": 2,
  "subject_id": 3,
  "grade_type_id": 1,
  "term": 1,
  "entries": [
    { "student_id": 10, "score": 85, "max_score": 100 },
    { "student_id": 11, "score": 70, "max_score": 100 }
  ]
}
```

---

### 7.4 الواجبات

```
GET  /api/teacher/assignments?class_id=2
POST /api/teacher/assignments
PUT  /api/teacher/assignments/{id}
DELETE /api/teacher/assignments/{id}
GET  /api/teacher/assignments/{id}/submissions
POST /api/teacher/assignments/{id}/submissions/{submission_id}/grade
```

---

### 7.5 المحتوى التعليمي

```
GET /api/teacher/content?subject_id=3&type=curriculum
GET /api/teacher/content?subject_id=3&type=presentation
```

---

### 7.6 الإشعارات والملف الشخصي

```
GET   /api/teacher/notifications
GET   /api/teacher/profile
PATCH /api/teacher/profile
```

---

## 8. API Endpoints — مدير المدرسة

**Base URL:** `/api/school-admin/`  
**Auth:** Bearer Token (role: school_admin)  
**ملاحظة:** جميع العمليات مقيدة بـ `school_id` المرتبط بحساب المدير.

---

### 8.1 إدارة بيانات المدرسة

```
GET   /api/school-admin/school
PATCH /api/school-admin/school
POST  /api/school-admin/school/logo
```

---

### 8.2 إدارة الصفوف الدراسية

```
GET    /api/school-admin/grades              -- المراحل الدراسية
POST   /api/school-admin/grades
PUT    /api/school-admin/grades/{id}
DELETE /api/school-admin/grades/{id}

GET    /api/school-admin/classes
POST   /api/school-admin/classes
PUT    /api/school-admin/classes/{id}
DELETE /api/school-admin/classes/{id}
```

---

### 8.3 إدارة الطلاب

```
GET    /api/school-admin/students?class_id=2&search=أحمد
POST   /api/school-admin/students
GET    /api/school-admin/students/{id}
PUT    /api/school-admin/students/{id}
DELETE /api/school-admin/students/{id}
POST   /api/school-admin/students/{id}/transfer    -- نقل لصف آخر
```

---

### 8.4 إدارة المعلمين

```
GET    /api/school-admin/teachers
POST   /api/school-admin/teachers               -- ربط معلم بالمدرسة
GET    /api/school-admin/teachers/{id}
PUT    /api/school-admin/teachers/{id}
DELETE /api/school-admin/teachers/{id}          -- فك الربط بالمدرسة
POST   /api/school-admin/teachers/{id}/assign   -- تعيين لصف + مادة
DELETE /api/school-admin/teachers/{id}/assign/{assignment_id}
```

---

### 8.5 اعتماد الحضور

```
GET   /api/school-admin/attendance?date=2024-11-01&class_id=2&status=pending
GET   /api/school-admin/attendance/{id}
PATCH /api/school-admin/attendance/{id}/approve
PATCH /api/school-admin/attendance/{id}/reject
POST  /api/school-admin/attendance/bulk-approve
```

---

### 8.6 اعتماد الدرجات

```
GET   /api/school-admin/grades?status=pending
PATCH /api/school-admin/grades/{id}/approve
PATCH /api/school-admin/grades/{id}/reject
POST  /api/school-admin/grades/bulk-approve
```

**عند الاعتماد:**  
```
grades.approval_status = 'approved'
→ NotificationService::sendToStudent(student_id, "تم اعتماد درجاتك")
→ NotificationService::sendToParent(parent_phone, "درجات ابنك")
→ FCM Push Notification
```

---

### 8.7 التقارير الذكية

```
GET /api/school-admin/reports/overview              -- نظرة عامة
GET /api/school-admin/reports/subjects-performance  -- أداء المواد
GET /api/school-admin/reports/classes-performance   -- أداء الصفوف
GET /api/school-admin/reports/struggling-students   -- الطلاب المتعثرون
GET /api/school-admin/reports/attendance-summary    -- ملخص الحضور
GET /api/school-admin/reports/ai-insights           -- تحليلات AI
```

---

### 8.8 الإشعارات

```
GET  /api/school-admin/notifications
POST /api/school-admin/notifications/broadcast     -- إرسال إشعار جماعي
```

---

## 9. API Endpoints — مدير النظام

**Base URL:** `/api/super-admin/`  
**Auth:** Bearer Token (role: super_admin)

---

### 9.1 إدارة المدارس

```
GET    /api/super-admin/schools
POST   /api/super-admin/schools
GET    /api/super-admin/schools/{id}
PUT    /api/super-admin/schools/{id}
DELETE /api/super-admin/schools/{id}
PATCH  /api/super-admin/schools/{id}/status
```

---

### 9.2 إدارة مدراء المدارس

```
GET    /api/super-admin/school-admins
POST   /api/super-admin/school-admins          -- إنشاء حساب مدير + ربطه بمدرسة
PUT    /api/super-admin/school-admins/{id}
DELETE /api/super-admin/school-admins/{id}
```

---

### 9.3 إدارة المعلمين (النظام كله)

```
GET    /api/super-admin/teachers
POST   /api/super-admin/teachers
GET    /api/super-admin/teachers/{id}
PUT    /api/super-admin/teachers/{id}
DELETE /api/super-admin/teachers/{id}
```

---

### 9.4 إدارة الطلاب (النظام كله)

```
GET    /api/super-admin/students?school_id=1
POST   /api/super-admin/students
GET    /api/super-admin/students/{id}
PUT    /api/super-admin/students/{id}
DELETE /api/super-admin/students/{id}
```

---

### 9.5 إدارة أولياء الأمور

```
GET    /api/super-admin/parents
POST   /api/super-admin/parents
PUT    /api/super-admin/parents/{id}
DELETE /api/super-admin/parents/{id}
GET    /api/super-admin/parents/{id}/children   -- أبناء ولي الأمر
```

---

### 9.6 إدارة المواد والمحتوى التعليمي

```
GET    /api/super-admin/subjects?school_id=1
POST   /api/super-admin/subjects
PUT    /api/super-admin/subjects/{id}
DELETE /api/super-admin/subjects/{id}

GET    /api/super-admin/content?subject_id=3&type=curriculum
POST   /api/super-admin/content                 -- رفع ملف جديد (multipart/form-data)
PUT    /api/super-admin/content/{id}
DELETE /api/super-admin/content/{id}
GET    /api/super-admin/content/{id}/download
```

---

### 9.7 إدارة الاختبارات

```
GET    /api/super-admin/exams
POST   /api/super-admin/exams
PUT    /api/super-admin/exams/{id}
DELETE /api/super-admin/exams/{id}

POST   /api/super-admin/exams/{id}/questions
PUT    /api/super-admin/exams/{id}/questions/{q_id}
DELETE /api/super-admin/exams/{id}/questions/{q_id}
```

---

### 9.8 إدارة الذكاء الاصطناعي

```
GET    /api/super-admin/ai/settings
PUT    /api/super-admin/ai/settings
POST   /api/super-admin/ai/analyze/{student_id}   -- تشغيل تحليل فوري
GET    /api/super-admin/ai/reports?school_id=1
POST   /api/super-admin/ai/run-batch               -- تحليل جميع الطلاب
```

---

### 9.9 إدارة النظام

```
GET  /api/super-admin/system/stats                  -- إحصائيات النظام
GET  /api/super-admin/system/audit-logs             -- سجل العمليات
GET  /api/super-admin/system/users                  -- جميع المستخدمين
POST /api/super-admin/system/backup                 -- نسخة احتياطية
GET  /api/super-admin/system/health                 -- حالة النظام
```

---

## 10. نظام الذكاء الاصطناعي

### 10.1 المعمارية

```
[PHP Backend] ──HTTP POST──► [Python AI Service :8000]
                                        │
                            ┌───────────┼───────────┐
                     تحليل الأداء   توليد اختبار   توصيات
                            │
                    ◄── JSON Response ──┘
                            │
              [PHP يحفظ في ai_analysis table]
              [PHP يرسل Notifications]
```

### 10.2 Python AI Service Endpoints (داخلية)

```
POST /ai/analyze-student
POST /ai/generate-exam
POST /ai/grade-answer
POST /ai/school-insights
```

**POST /ai/analyze-student Payload:**
```json
{
  "student_id": 123,
  "grades": [
    { "subject": "الرياضيات", "scores": [85, 90, 78], "max": 100 }
  ],
  "attendance": {
    "total_days": 100,
    "present_days": 91,
    "absent_days": 9
  },
  "previous_analysis": null
}
```

**Response:**
```json
{
  "overall_score": 78.5,
  "risk_level": "medium",
  "strong_subjects": ["الرياضيات"],
  "weak_subjects": ["اللغة العربية"],
  "recommendations": [
    {
      "subject": "اللغة العربية",
      "topics": ["النحو", "الإملاء"],
      "priority": "high",
      "message": "يحتاج مراجعة مكثفة لقواعد النحو"
    }
  ]
}
```

### 10.3 جدولة التحليل التلقائي

```
CRON Job (PHP):
- كل أسبوع: تحليل جميع الطلاب
- عند اعتماد درجات جديدة: تحليل الطلاب المعنيين
- عند رفع كشف حضور: تحديث بيانات الحضور
```

---

## 11. نظام الإشعارات

### 11.1 تدفق إشعار الغياب

```
1. المعلم يرفع كشف الحضور (POST /teacher/attendance)
2. PHP يحفظ في جدول attendance (status: pending)
3. مدير المدرسة يعتمد الكشف (PATCH /school-admin/attendance/{id}/approve)
4. NotificationService يبحث عن الغائبين
5. لكل غائب:
   a. ابحث عن parent_phone من جدول students
   b. ابحث عن user_id من جدول parents (phone match)
   c. أنشئ سجل في جدول notifications
   d. أرسل FCM Push Notification
   e. (اختياري) أرسل SMS
```

### 11.2 تدفق إشعار الدرجات

```
1. المعلم يدخل الدرجات
2. مدير المدرسة يعتمد
3. PHP:
   → إشعار للطالب: "تم اعتماد درجاتك في مادة الرياضيات"
   → إشعار لولي الأمر: "درجات ابنك أحمد في مادة الرياضيات: 85/100"
```

### 11.3 NotificationService (PHP)

```php
class NotificationService {
    public function send(int $userId, array $data): void {
        // 1. حفظ في DB
        $this->saveToDatabase($userId, $data);
        // 2. FCM Push
        $this->sendFCM($userId, $data);
    }
    
    public function sendToParentsByStudentId(int $studentId, array $data): void {
        $parentPhone = $this->getParentPhone($studentId);
        $parent = $this->findParentByPhone($parentPhone);
        if ($parent) {
            $this->send($parent['user_id'], $data);
        }
    }
    
    public function broadcastToClass(int $classId, array $data): void {
        $students = $this->getStudentsByClass($classId);
        foreach ($students as $student) {
            $this->send($student['user_id'], $data);
        }
    }
}
```

---

## 12. نظام إدارة الملفات

### 12.1 هيكل التخزين

```
storage/uploads/
├── curricula/          -- المقررات الدراسية (PDF)
│   └── {school_id}/{subject_id}/filename.pdf
├── summaries/          -- الملخصات (PDF)
│   └── {school_id}/{subject_id}/filename.pdf
├── references/         -- المراجع (PDF, DOCX)
│   └── {school_id}/{subject_id}/filename.pdf
├── presentations/      -- العروض التقديمية (PPTX, PDF)
│   └── {school_id}/{subject_id}/filename.pptx
└── avatars/            -- صور المستخدمين
    └── {user_id}/avatar.jpg
```

### 12.2 قواعد رفع الملفات

```
المقررات والملخصات:  PDF فقط, حد أقصى 50 MB
العروض التقديمية:    PPTX, PDF, حد أقصى 100 MB
الصور:              JPG, PNG, حد أقصى 5 MB

التحقق:
- MIME Type Detection (finfo_file)
- File Extension Whitelist
- Virus Scan (ClamAV إن أمكن)
- تغيير اسم الملف لـ hash عشوائي
```

### 12.3 API للتحميل

```
POST /api/super-admin/content
Content-Type: multipart/form-data

{
  "subject_id": 3,
  "school_id": 1,
  "title": "كتاب الرياضيات الصف السابع",
  "type": "curriculum",
  "target_role": "student",
  "file": [binary]
}
```

---

## 13. قواعد الأمان

### 13.1 إجراءات أمان إلزامية

```
✅ Prepared Statements لجميع استعلامات SQL (منع SQL Injection)
✅ Input Validation + Sanitization لجميع المدخلات
✅ JWT مع انتهاء صلاحية قصير (Access: 1 ساعة, Refresh: 30 يوم)
✅ HTTPS إلزامي
✅ Rate Limiting (100 طلب/دقيقة لكل IP)
✅ CORS مضبوط على Domains المصرح بها
✅ Password Hashing بـ password_hash(PASSWORD_BCRYPT, ['cost'=>12])
✅ File Upload Validation
✅ Audit Log لجميع العمليات الحساسة
✅ School Isolation: كل مدير مدرسة يرى فقط بيانات مدرسته
```

### 13.2 مثال على School Isolation

```php
// في كل Endpoint خاص بمدير المدرسة
$schoolId = $auth->getSchoolId(); // من JWT

$students = $db->query(
    "SELECT * FROM students WHERE school_id = ?",
    [$schoolId]  // لا يمكن الوصول لطلاب مدارس أخرى
);
```

### 13.3 HTTP Response Codes

| Code | الحالة                        |
|------|-------------------------------|
| 200  | نجاح                          |
| 201  | تم الإنشاء                    |
| 400  | خطأ في المدخلات               |
| 401  | غير مصادق (Unauthenticated)   |
| 403  | غير مصرح (Unauthorized)       |
| 404  | غير موجود                     |
| 422  | خطأ في التحقق من البيانات     |
| 429  | تجاوز حد الطلبات              |
| 500  | خطأ داخلي                    |

---

## 14. خارطة العمل لفريق التطوير

### 📅 المراحل المقترحة

#### المرحلة 1 — البنية التحتية (أسبوعان)
- [ ] إعداد Server وقاعدة البيانات
- [ ] كتابة جميع Migration Files (25 جدول)
- [ ] بناء `core/` (Database, Router, Request, Response, Auth)
- [ ] بناء نظام JWT (تسجيل دخول، Refresh، تسجيل خروج)
- [ ] بناء Middleware (Auth, Role, RateLimit)

#### المرحلة 2 — مدير النظام (أسبوعان)
- [ ] CRUD كامل للمدارس
- [ ] CRUD المستخدمين (جميع الأدوار)
- [ ] إدارة المواد والمحتوى التعليمي
- [ ] رفع الملفات وإدارتها
- [ ] إدارة الصفوف

#### المرحلة 3 — مدير المدرسة (أسبوعان)
- [ ] إدارة بيانات المدرسة
- [ ] CRUD الطلاب والمعلمين
- [ ] اعتماد الحضور والدرجات
- [ ] التقارير الذكية

#### المرحلة 4 — المعلم (أسبوع)
- [ ] عرض المدارس والفصول
- [ ] كشف الحضور اليومي
- [ ] إدخال الدرجات
- [ ] الواجبات والتكاليف

#### المرحلة 5 — الطالب وولي الأمر (أسبوعان)
- [ ] لوحة التحليل
- [ ] صفحة المواد والمحتوى
- [ ] الواجبات
- [ ] API ولي الأمر كامل

#### المرحلة 6 — الذكاء الاصطناعي (أسبوعان)
- [ ] بناء Python AI Service
- [ ] نظام توليد الاختبارات الذكية
- [ ] تحليل أداء الطلاب
- [ ] نظام التوصيات
- [ ] Cron Jobs للتحليل الدوري

#### المرحلة 7 — الإشعارات والتكامل (أسبوع)
- [ ] إعداد Firebase FCM
- [ ] NotificationService كامل
- [ ] اختبار تدفق الغياب والدرجات

#### المرحلة 8 — الاختبار والتسليم (أسبوعان)
- [ ] Unit Testing للـ API
- [ ] Integration Testing
- [ ] توثيق الـ API (Postman Collection)
- [ ] Security Audit
- [ ] Performance Testing

---

### 👥 توزيع العمل المقترح على الفريق

| المطور | المسؤولية |
|--------|-----------|
| **مطور 1** (Backend Lead) | Core System, Auth, Database Design, super_admin APIs |
| **مطور 2** (Backend) | school_admin APIs, teacher APIs, Attendance System |
| **مطور 3** (Backend) | student APIs, parent APIs, Notification System |
| **مطور 4** (AI Engineer) | Python AI Service, Exam Generator, Analysis Engine |
| **مطور 5** (DevOps) | Server Setup, CI/CD, Backup, Security |

---

> **إجمالي وقت التطوير المتوقع:** 12–16 أسبوعاً بفريق من 4-5 مطورين  
> **قاعدة البيانات:** 25+ جدول، 50+ علاقة  
> **عدد API Endpoints:** ~120+ نقطة  
> **الأولوية القصوى:** تصميم قاعدة البيانات أولاً قبل أي سطر كود
