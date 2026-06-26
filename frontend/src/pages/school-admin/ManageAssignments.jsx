import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faChalkboardTeacher, faBook, faUsers, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const ManageAssignments = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, sRes, aRes] = await Promise.all([
        axiosInstance.get('/school-admin/teachers'),
        axiosInstance.get('/school-admin/classes'),
        axiosInstance.get('/school-admin/subjects'),
        axiosInstance.get('/school-admin/assignments')
      ]);
      setTeachers(tRes.data?.data || []);
      setClasses(cRes.data?.data || []);
      setSubjects(sRes.data?.data || []);
      setAssignments(aRes.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssignment = () => {
    Swal.fire({
      title: 'إسناد معلم لمادة وفصل',
      html: `
        <div class="text-start mb-3">
          <label class="form-label small">المعلم</label>
          <select id="teacher_id" class="form-select">
            ${teachers.map(t => `<option value="${t.id}">${t.name} (${t.specialization})</option>`).join('')}
          </select>
        </div>
        <div class="text-start mb-3">
          <label class="form-label small">الفصل</label>
          <select id="class_id" class="form-select">
            ${classes.map(c => `<option value="${c.id}">${c.grade_level_name} - ${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="text-start mb-3">
          <label class="form-label small">المادة</label>
          <select id="subject_id" class="form-select">
            ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'إسناد',
      preConfirm: () => ({
        teacher_id: document.getElementById('teacher_id').value,
        class_id: document.getElementById('class_id').value,
        subject_id: document.getElementById('subject_id').value,
        academic_year_id: 1 // Default
      })
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await axiosInstance.post('/school-admin/assignments', res.value);
          fetchData();
          Swal.fire('تم الإسناد', '', 'success');
        } catch (err) { Swal.fire('خطأ', 'فشل في العملية', 'error'); }
      }
    });
  };

  return (
    <div>
      <div className="page-hero mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>إسناد المعلمين (نصاب القرارات)</h2>
            <p className="mb-0 opacity-80">توزيع المعلمين على الفصول والمواد الدراسية</p>
          </div>
          <button className="btn btn-primary" onClick={handleAddAssignment}>
             <FontAwesomeIcon icon={faPlus} className="me-2" /> إسناد جديد
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted small">
              <tr>
                <th className="ps-4">المعلم</th>
                <th>المادة</th>
                <th>الفصل الدراسي</th>
                <th className="text-center pe-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-primary"></div></td></tr>
              ) : assignments.length > 0 ? (
                assignments.map(a => (
                  <tr key={a.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faChalkboardTeacher} className="text-primary" />
                        <div className="fw-bold">{a.teacher_name}</div>
                      </div>
                    </td>
                    <td>
                       <div className="badge bg-info bg-opacity-10 text-info fw-bold">{a.subject_name}</div>
                    </td>
                    <td>
                       <div className="small fw-bold">{a.grade_name}</div>
                       <div className="text-muted" style={{ fontSize: 10 }}>شعبة: {a.class_name}</div>
                    </td>
                    <td className="text-center pe-4">
                       <button className="btn btn-icon btn-sm btn-light text-danger">
                          <FontAwesomeIcon icon={faTrash} />
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center py-5 text-muted">لا يوجد إسنادات حالياً</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageAssignments;
