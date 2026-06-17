<?php
// api/teacher/grades.php

use Core\Validator;
use Core\Response;
use Core\Auth;
use Services\TeacherGradeService;

/** @var \Core\Request $req */

$method = $req->method();
$service = new TeacherGradeService();
$currentUser = Auth::user($req);

switch ($method) {
    case 'GET':
        $classId = (int)$req->query('class_id');
        $subjectId = (int)$req->query('subject_id');
        $examType = $req->query('exam_type');

        if (!$classId || !$subjectId || !$examType) {
            Response::error('الصف، المادة، ونوع الاختبار مطلوبين', 400);
        }

        Response::success($service->getGrades($currentUser['id'], $classId, $subjectId, $examType));
        break;

    case 'POST':
        $v = Validator::make($req->all(), [
            'class_id'   => 'required|integer',
            'subject_id' => 'required|integer',
            'exam_type'  => 'required|in:first_month,mid_term,second_month,final,activity',
            'max_score'  => 'integer',
            'students'   => 'required|array'
        ]);
        $v->failAndRespond();

        // Validate each student entry
        $data = $v->validated();
        foreach ($data['students'] as $student) {
            if (!isset($student['student_id']) || !isset($student['score'])) {
                Response::validationError(['students' => ['بيانات الطالب غير مكتملة (student_id, score)']]);
            }
            if (!is_numeric($student['score'])) {
                Response::validationError(['students' => ['يجب أن تكون الدرجة رقماً']]);
            }
        }

        $service->recordGrades($currentUser['id'], $data);
        Response::success(null, 'تم حفظ الدرجات بنجاح وبانتظار اعتماد الإدارة');
        break;

    default:
        Response::error('Method Not Allowed', 405);
}
