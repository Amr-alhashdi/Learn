<?php
// api/super-admin/subjects.php

use Core\Validator;
use Core\Response;
use Services\SubjectService;

/** @var \Core\Request $req */

$method = $req->method();
$subjectService = new SubjectService();

switch ($method) {
    case 'GET':
        $id = $req->param('id');
        if ($id) {
            $subject = $subjectService->getById((int)$id);
            Response::success($subject);
        } else {
            $schoolId = (int)$req->query('school_id');
            if (!$schoolId) Response::error('معرف المدرسة (school_id) مطلوب', 400);

            $page = $req->page();
            $perPage = $req->perPage();
            
            $result = $subjectService->getAll($schoolId, $page, $perPage);
            Response::paginated($result);
        }
        break;

    case 'POST':
        $v = Validator::make($req->all(), [
            'school_id'   => 'required|integer',
            'name'        => 'required|string|max:150',
            'name_en'     => 'string|max:150',
            'code'        => 'string|max:20',
            'description' => 'string',
            'icon'        => 'string|max:100',
            'color'       => 'string|max:10'
        ]);
        $v->failAndRespond();
        
        $subject = $subjectService->create($v->validated());
        Response::created($subject, 'تم إضافة المادة بنجاح');
        break;

    case 'PUT':
        $id = (int)$req->param('id');
        if (!$id) Response::error('معرف المادة مطلوب', 400);

        $v = Validator::make($req->all(), [
            'name'        => 'string|max:150',
            'name_en'     => 'string|max:150',
            'code'        => 'string|max:20',
            'description' => 'string',
            'icon'        => 'string|max:100',
            'color'       => 'string|max:10'
        ]);
        $v->failAndRespond();

        $subject = $subjectService->update($id, $v->validated());
        Response::success($subject, 'تم تحديث بيانات المادة بنجاح');
        break;

    case 'DELETE':
        $id = (int)$req->param('id');
        if (!$id) Response::error('معرف المادة مطلوب', 400);

        $subjectService->delete($id);
        Response::success(null, 'تم حذف المادة بنجاح');
        break;

    default:
        Response::error('Method Not Allowed', 405);
}
