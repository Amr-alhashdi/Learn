<?php
// api/teacher/attendance.php

use Core\Validator;
use Core\Response;
use Core\Auth;
use Services\TeacherAttendanceService;

/** @var \Core\Request $req */

$method = $req->method();
$service = new TeacherAttendanceService();
$currentUser = Auth::user($req);

switch ($method) {
    case 'GET':
        $classId = (int)$req->query('class_id');
        $date = $req->query('date') ?: date('Y-m-d');
        if (!$classId) Response::error('الصف مطلوب', 400);

        Response::success($service->getAttendance($currentUser['id'], $classId, $date));
        break;

    case 'POST':
        $v = Validator::make($req->all(), [
            'class_id' => 'required|integer',
            'date'     => 'date',
            'students' => 'required|array'
        ]);
        $v->failAndRespond();

        // Validate each student entry
        $data = $v->validated();
        foreach ($data['students'] as $student) {
            if (!isset($student['student_id']) || !isset($student['status'])) {
                Response::validationError(['students' => ['بيانات الطالب غير مكتملة (student_id, status)']]);
            }
            if (!in_array($student['status'], ['present', 'absent', 'late', 'excused'])) {
                Response::validationError(['students' => ['حالة الحضور غير صالحة']]);
            }
        }

        $service->recordAttendance($currentUser['id'], $data);
        Response::success(null, 'تم حفظ الحضور والغياب بنجاح وبانتظار اعتماد الإدارة');
        break;

    default:
        Response::error('Method Not Allowed', 405);
}
