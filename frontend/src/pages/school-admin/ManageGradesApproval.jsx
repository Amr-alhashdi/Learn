import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckDouble, faTimesCircle, faFileAlt, faUserGraduate, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const ManageGradesApproval = () => {
  const [pendingGrades, setPendingGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingGrades();
  }, []);

  const fetchPendingGrades = async () => {
    try {
      const res = await axiosInstance.get('/school-admin/grades?status=pending');
      setPendingGrades(res.data?.data || [
        { id: 1, student_name: 'محمد أحمد', subject_name: 'الرياضيات', teacher_name: 'أحمد علي', score: 18, max_score: 20, grade_type: 'شهر أكتوبر' },
        { id: 2, student_name: 'سارة خالد', subject_name: 'الرياضيات', teacher_name: 'أحمد علي', score: 19, max_score: 20, grade_type: 'شهر أكتوبر' },
      ]);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleApproveAll = async () => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "سيتم اعتماد كافة الدرجات وإرسال النتائج للطلاب وأولياء الأمور فوراً",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، اعتمد الجميع',
      cancelButtonText: 'إلغاء'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.patch('/school-admin/grades/approve-all');
        fetchPendingGrades();
        Swal.fire('تم الاعتماد', 'تم إرسال النتائج بنجاح', 'success');
      } catch (err) { Swal.fire('خطأ', 'فشل في اعتماد الدرجات', 'error'); }
    }
  };

  return (
    <div>
      <div className="page-hero mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>إعتماد النتائج الشهرية</h2>
            <p className="mb-0 opacity-80">مراجعة الدرجات المدخلة من قبل المعلمين قبل نشرها للطلاب</p>
          </div>
          {pendingGrades.length > 0 && (
            <button className="btn btn-success px-4 py-2 fw-bold" onClick={handleApproveAll}>
              <FontAwesomeIcon icon={faCheckDouble} className="me-2" /> اعتماد كافة النتائج الموضحة
            </button>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light small">
              <tr>
                <th className="ps-4">الطالب</th>
                <th>المادة/المعلم</th>
                <th>نوع التقييم</th>
                <th>الدرجة</th>
                <th className="text-center pe-4">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan="5" className="text-center py-5"><div className="spinner-primary"></div></td></tr>
              ) : pendingGrades.length > 0 ? (
                pendingGrades.map(g => (
                  <tr key={g.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faUserGraduate} className="text-muted" />
                        <div className="fw-bold small">{g.student_name}</div>
                      </div>
                    </td>
                    <td>
                      <div className="small fw-bold text-primary">{g.subject_name}</div>
                      <div className="text-muted" style={{ fontSize: 10 }}>المعلم: {g.teacher_name}</div>
                    </td>
                    <td><span className="badge bg-light text-dark border">{g.grade_type}</span></td>
                    <td>
                       <div className="fw-bold text-success">{g.score} <span className="text-muted small">/ {g.max_score}</span></div>
                    </td>
                    <td className="text-center pe-4">
                       <div className="d-flex justify-content-center gap-1">
                          <button className="btn btn-sm btn-outline-success"><FontAwesomeIcon icon={faCheckCircle} /></button>
                          <button className="btn btn-sm btn-outline-danger"><FontAwesomeIcon icon={faTimesCircle} /></button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted">لا توجد درجات معلقة للاعتماد حالياً</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageGradesApproval;
