<?php
// api/school-admin/students.php

use Core\Validator;
use Core\Response;
use Core\Auth;
use Services\SchoolStudentService;

/** @var \Core\Request $req */

$method = $req->method();
$service = new SchoolStudentService();
$currentUser = Auth::user($req);

$schoolId = (int)$req->query('school_id');
if (!$schoolId) {
    if (empty($currentUser['school_ids'])) Response::forbidden('ليس لديك صلاحية على أي مدرسة');
    $schoolId = $currentUser['school_ids'][0];
} else {
    Auth::requireSchool($currentUser, $schoolId);
}

switch ($method) {
    case 'GET':
        $id = $req->param('id');
        if ($id) {
            $student = $service->getById($schoolId, (int)$id);
            Response::success($student);
        } else {
            $page = $req->page();
            $perPage = $req->perPage();
            $classId = $req->query('class_id') ? (int)$req->query('class_id') : null;
            
            $result = $service->getAll($schoolId, $page, $perPage, $classId);
            Response::paginated($result);
        }
        break;

    case 'POST':
        $v = Validator::make($req->all(), [
            'name'          => 'required|string|min:3|max:150',
            'email'         => 'email|max:150',
            'password'      => 'required|string|min:6',
            'class_id'      => 'required|integer',
            'student_code'  => 'required|string|max:30',
            'parent_phone'  => 'required|string|max:30',
            'date_of_birth' => 'date',
            'gender'        => 'in:male,female',
            'address'       => 'string'
        ]);
        $v->failAndRespond();
        
        $student = $service->create($schoolId, $v->validated());
        Response::created($student, 'تم إضافة الطالب بنجاح');
        break;

    case 'PUT':
        $id = (int)$req->param('id');
        if (!$id) Response::error('معرف الطالب مطلوب', 400);

        $v = Validator::make($req->all(), [
            'name'          => 'string|min:3|max:150',
            'email'         => 'email|max:150',
            'password'      => 'string|min:6',
            'class_id'      => 'integer',
            'student_code'  => 'string|max:30',
            'parent_phone'  => 'string|max:30',
            'date_of_birth' => 'date',
            'gender'        => 'in:male,female',
            'address'       => 'string',
            'is_active'     => 'boolean',
            'status'        => 'in:active,suspended,transferred,graduated'
        ]);
        $v->failAndRespond();

        $student = $service->update($schoolId, $id, $v->validated());
        Response::success($student, 'تم تحديث بيانات الطالب بنجاح');
        break;

    default:
        Response::error('Method Not Allowed', 405);
}
