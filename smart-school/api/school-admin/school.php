<?php
// api/school-admin/school.php

use Core\Validator;
use Core\Response;
use Core\Auth;
use Services\SchoolAdminService;

/** @var \Core\Request $req */

$method = $req->method();
$service = new SchoolAdminService();
$currentUser = Auth::user($req);

// A school admin should pass school_id in header or query if they manage multiple, 
// for now, we just pick the first one they manage, or require it.
$schoolId = (int)$req->query('school_id');
if (!$schoolId) {
    if (empty($currentUser['school_ids'])) {
        Response::forbidden('ليس لديك صلاحية على أي مدرسة');
    }
    $schoolId = $currentUser['school_ids'][0];
} else {
    Auth::requireSchool($currentUser, $schoolId);
}

switch ($method) {
    case 'GET':
        $school = $service->getSchoolInfo($schoolId);
        Response::success($school);
        break;

    case 'PATCH':
    case 'PUT':
        $v = Validator::make($req->all(), [
            'name'     => 'string|min:3|max:200',
            'name_en'  => 'string|max:200',
            'phone'    => 'string|max:30',
            'address'  => 'string',
            'city'     => 'string',
            'email'    => 'email',
            'website'  => 'url'
        ]);
        $v->failAndRespond();

        $school = $service->updateSchoolInfo($schoolId, $v->validated());
        Response::success($school, 'تم تحديث بيانات المدرسة بنجاح');
        break;

    case 'POST':
        // Specifically for logo upload if action=logo
        if ($req->query('action') === 'logo') {
            $file = $req->file('logo');
            if (!$file) {
                 Response::validationError(['logo' => ['صورة الشعار مطلوبة']]);
            }
            $school = $service->updateLogo($schoolId, $file);
            Response::success($school, 'تم تحديث شعار المدرسة بنجاح');
        } else {
            Response::error('Action not supported', 400);
        }
        break;

    default:
        Response::error('Method Not Allowed', 405);
}
