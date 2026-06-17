<?php
// api/school-admin/teachers.php

use Core\Validator;
use Core\Response;
use Core\Auth;
use Services\SchoolTeacherService;

/** @var \Core\Request $req */

$method = $req->method();
$service = new SchoolTeacherService();
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
            $teacher = $service->getById($schoolId, (int)$id);
            Response::success($teacher);
        } else {
            $page = $req->page();
            $perPage = $req->perPage();
            
            $result = $service->getAll($schoolId, $page, $perPage);
            Response::paginated($result);
        }
        break;

    case 'POST':
        // If the path contains 'assign', it's an assignment request
        if (str_ends_with($req->path(), '/assign')) {
            $id = (int)$req->param('id');
            if (!$id) Response::error('معرف المعلم مطلوب', 400);

            $v = Validator::make($req->all(), [
                'class_id'   => 'required|integer',
                'subject_id' => 'required|integer'
            ]);
            $v->failAndRespond();
            
            $data = $v->validated();
            // Reuse createOrAssign logic by passing the ID
            // Actually, we can just call createOrAssign directly
            // But let's build a dedicated endpoint for assign
            $service->createOrAssign($schoolId, [
                'email' => $service->getById($schoolId, $id)['email'], // little hacky to reuse
                'class_id' => $data['class_id'],
                'subject_id' => $data['subject_id']
            ]);
            Response::success(null, 'تم تعيين المعلم بنجاح');
            break;
        }

        // Otherwise it's a create/assign request
        $v = Validator::make($req->all(), [
            'name'           => 'required|string|min:3|max:150',
            'email'          => 'email|max:150',
            'phone'          => 'string|max:30',
            'password'       => 'string|min:6', // Optional if user exists
            'specialization' => 'string',
            'qualification'  => 'string',
            'hire_date'      => 'date',
            'class_id'       => 'integer',
            'subject_id'     => 'integer'
        ]);
        $v->failAndRespond();
        
        $teacher = $service->createOrAssign($schoolId, $v->validated());
        Response::created($teacher, 'تم إضافة المعلم بنجاح');
        break;

    case 'DELETE':
        $id = (int)$req->param('id');
        $assignmentId = (int)$req->param('assignment_id');
        
        if (!$id || !$assignmentId) Response::error('معرف المعلم والتعيين مطلوب', 400);

        $service->removeAssignment($schoolId, $id, $assignmentId);
        Response::success(null, 'تم إلغاء التعيين بنجاح');
        break;

    default:
        Response::error('Method Not Allowed', 405);
}
