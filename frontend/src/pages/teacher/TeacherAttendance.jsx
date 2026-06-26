import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faUsers, faCheckCircle, faTimesCircle,
  faStar, faUserEdit, faSave, faArrowRight, faFilter
} from '@fortawesome/free-solid-svg-icons';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const TeacherAttendance = () => {
  const [searchParams] = useSearchParams();
  const schoolId = searchParams.get('school');
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      const res = await axiosInstance.get(`/teacher/meta?school_id=${schoolId}`);
      setClasses(res.data?.classes || [
         { id: 1, name: 'السابع (أ)', grade: 'المرحلة الإعدادية' },
         { id: 2, name: 'السابع (ب)', grade: 'المرحلة الإعدادية' }
      ]);
      setSubjects(res.data?.subjects || [
         { id: 101, name: 'الرياضيات' },
         { id: 102, name: 'الفيزياء' }
      ]);
    } catch (e) { console.error(e); }
  };

  const loadStudents = async () => {
    if(!selectedClass) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/teacher/students?class_id=${selectedClass}`);
      setStudents(res.data?.data?.map(s => ({
        ...s,
        status: 'present',
        participation: 0,
        behavior: 0,
        note: ''
      })) || [
         { id: 1, name: 'أحمد محمود علي', status: 'present', participation: 5, behavior: 5, note: '' },
         { id: 2, name: 'سارة خالد جابر', status: 'present', participation: 4, behavior: 5, note: '' },
         { id: 3, name: 'ياسين محمد عمر', status: 'absent', participation: 0, behavior: 0, note: '' },
      ]);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleStatusChange = (id, status) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleGradeChange = (id, field, value) => {
     setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await axiosInstance.post('/teacher/daily-followup', {
         class_id: selectedClass,
         subject_id: selectedSubject,
         date: new Date().toISOString().split('T')[0],
         students: students.map(s => ({
            id: s.id,
            status: s.status,
            participation: s.participation,
            behavior: s.behavior,
            note: s.note
         }))
      });
      Swal.fire('تم الحفظ', 'تم رفع كشف المتابعة بنجاح بانتظار اعتماد المدير', 'success');
    } catch (e) {
      Swal.fire('خطأ', 'فشل في حفظ البيانات', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-hero mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>كشف المتابعة اليومي</h2>
            <p className="mb-0 opacity-80 small">تحضير الطلاب، تقييم المشاركة، ومتابعة السلوك للحصة</p>
          </div>
          <div className="d-flex gap-2">
             <select className="form-select border-0 shadow-sm" value={selectedClass} onChange={(e)=>setSelectedClass(e.target.value)}>
                <option value="">اختر الفصل...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
             <select className="form-select border-0 shadow-sm" value={selectedSubject} onChange={(e)=>setSelectedSubject(e.target.value)}>
                <option value="">المادة...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
             </select>
             <button className="btn btn-white text-primary fw-bold" onClick={loadStudents} disabled={!selectedClass}>
                <FontAwesomeIcon icon={faFilter} className="me-1" /> عرض
             </button>
          </div>
        </div>
      </div>

      {loading ? (
         <div className="text-center py-5"><div className="spinner-primary"></div></div>
      ) : students.length > 0 ? (
        <div className="animate-in">
           <div className="card shadow-sm border-0 overflow-hidden">
              <div className="table-responsive">
                 <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light small">
                       <tr>
                          <th className="ps-4">الطالب</th>
                          <th className="text-center">حالة الحضور</th>
                          <th className="text-center">المشاركة (5)</th>
                          <th className="text-center">السلوك (5)</th>
                          <th>ملاحظات المعلم</th>
                       </tr>
                    </thead>
                    <tbody>
                       {students.map(s => (
                          <tr key={s.id}>
                             <td className="ps-4">
                                <div className="fw-bold">{s.name}</div>
                                <div className="text-muted" style={{ fontSize: 10 }}>رقم الطالب: {s.id}</div>
                             </td>
                             <td>
                                <div className="d-flex justify-content-center gap-2">
                                   <button 
                                      onClick={() => handleStatusChange(s.id, 'present')}
                                      className={`btn btn-sm btn-icon ${s.status === 'present' ? 'btn-success' : 'btn-outline-success'}`}
                                      title="حاضر"
                                   >
                                      <FontAwesomeIcon icon={faCheckCircle} />
                                   </button>
                                   <button 
                                      onClick={() => handleStatusChange(s.id, 'absent')}
                                      className={`btn btn-sm btn-icon ${s.status === 'absent' ? 'btn-danger' : 'btn-outline-danger'}`}
                                      title="غائب"
                                   >
                                      <FontAwesomeIcon icon={faTimesCircle} />
                                   </button>
                                </div>
                             </td>
                             <td className="text-center">
                                <input 
                                   type="number" 
                                   className="form-control form-control-sm mx-auto bg-light border-0" 
                                   style={{ width: 60 }} 
                                   min="0" max="5" 
                                   value={s.participation} 
                                   onChange={(e) => handleGradeChange(s.id, 'participation', e.target.value)}
                                   disabled={s.status === 'absent'}
                                />
                             </td>
                             <td className="text-center">
                                <input 
                                   type="number" 
                                   className="form-control form-control-sm mx-auto bg-light border-0" 
                                   style={{ width: 60 }} 
                                   min="0" max="5" 
                                   value={s.behavior} 
                                   onChange={(e) => handleGradeChange(s.id, 'behavior', e.target.value)}
                                   disabled={s.status === 'absent'}
                                />
                             </td>
                             <td>
                                <input 
                                   type="text" 
                                   className="form-control form-control-sm bg-light border-0" 
                                   placeholder="أضف ملاحظة..." 
                                   value={s.note}
                                   onChange={(e) => handleGradeChange(s.id, 'note', e.target.value)}
                                />
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
           
           <div className="d-flex justify-content-end mt-4">
              <button className="btn btn-primary px-5 py-3 d-flex align-items-center gap-2" onClick={handleSubmit} disabled={saving}>
                 {saving ? <div className="spinner-border spinner-border-sm"></div> : <FontAwesomeIcon icon={faSave} />}
                 <span>حفظ ورفع الكشف للمدير</span>
              </button>
           </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0 p-5 text-center text-muted">
           <FontAwesomeIcon icon={faClipboardList} size="4x" className="mb-3 opacity-20" />
           <h5>يرجى اختيار الفصل والمادة لعرض قائمة الطلاب</h5>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
