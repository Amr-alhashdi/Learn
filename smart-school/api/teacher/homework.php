<?php
// api/teacher/homework.php

use Core\Validator;
use Core\Response;
use Core\Auth;
use Services\TeacherHomeworkService;

/** @var \Core\Request $req */

$method = $req->method();
$service = new TeacherHomeworkService();
$currentUser = Auth::user($req);

switch ($method) {
    case 'GET':
        $classId = (int)$req->query('class_id');
        $subjectId = (int)$req->query('subject_id');

        if (!$classId || !$subjectId) {
            Response::error('الصف والمادة مطلوبين', 400);
        }

        $page = $req->page();
        $perPage = $req->perPage();

        Response::paginated($service->getAll($currentUser['id'], $classId, $subjectId, $page, $perPage));
        break;

    case 'POST':
        $v = Validator::make($req->all(), [
            'class_id'   => 'required|integer',
            'subject_id' => 'required|integer',
            'title'      => 'required|string|max:200',
            'description'=> 'string',
            'due_date'   => 'required|date'
        ]);
        $v->failAndRespond();

        $file = $req->file('file');
        
        $homework = $service->create($currentUser['id'], $v->validated(), $file);
        Response::created($homework, 'تم إضافة الواجب بنجاح');
        break;

    case 'DELETE':
        $id = (int)$req->param('id');
        if (!$id) Response::error('معرف الواجب مطلوب', 400);

        $service->delete($currentUser['id'], $id);
        Response::success(null, 'تم حذف الواجب بنجاح');
        break;

    default:
        Response::error('Method Not Allowed', 405);
}
