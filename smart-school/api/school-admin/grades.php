<?php
// api/school-admin/grades.php

use Core\Response;
use Core\Auth;
use Services\ApprovalService;

/** @var \Core\Request $req */

$method = $req->method();
$service = new ApprovalService();
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
        $filters = [
            'class_id' => $req->query('class_id') ? (int)$req->query('class_id') : null
        ];
        $result = $service->getPendingGrades($schoolId, $filters);
        Response::success($result);
        break;

    case 'PATCH':
        $id = (int)$req->param('id');
        $action = $req->path(); // .../approve or .../reject
        
        if (!$id) Response::error('معرف السجل مطلوب', 400);

        if (str_ends_with($action, '/approve')) {
            $service->approveGrade($schoolId, $id, $currentUser['id']);
            Response::success(null, 'تم اعتماد الدرجة');
        } elseif (str_ends_with($action, '/reject')) {
            $service->rejectGrade($schoolId, $id, $currentUser['id']);
            Response::success(null, 'تم رفض الدرجة');
        } else {
            Response::error('Action not supported', 400);
        }
        break;

    default:
        Response::error('Method Not Allowed', 405);
}
