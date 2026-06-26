import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faSearch, faUserGraduate, faIdCard, faMapMarkerAlt,
  faPhone, faGraduationCap, faEdit, faTrash, faFilter,
  faCircleCheck, faUserShield
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', academic_year_id: 1, grade_level_id: '',
    class_id: '', student_code: '', parent_phone: '',
    gender: 'male', address: '', email: '', password: 'password'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [sRes, gRes, cRes] = await Promise.all([
        axiosInstance.get('/school-admin/students'),
        axiosInstance.get('/school-admin/grades'),
        axiosInstance.get('/school-admin/classes')
      ]);
      setStudents(sRes.data?.data || []);
      setGrades(gRes.data?.data || []);
      setClasses(cRes.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/school-admin/students', formData);
      setShowModal(false);
      resetForm();
      fetchInitialData();
      Swal.fire('تم بنجاح', 'تم تسجيل الطالب في النظام بنجاح', 'success');
    } catch (err) {
      Swal.fire('خطأ', err.response?.data?.message || 'فشل في تسجيل الطالب', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', academic_year_id: 1, grade_level_id: '',
      class_id: '', student_code: '', parent_phone: '',
      gender: 'male', address: '', email: '', password: 'password'
    });
  };

  const filteredStudents = students.filter(s => 
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.student_code?.includes(searchTerm)) &&
    (selectedGrade === '' || s.grade_level_id == selectedGrade)
  );

  return (
    <div>
      <div className="page-hero mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>إدارة شئون الطلاب</h2>
            <p className="mb-0 opacity-80">تسجيل الطلاب، تصنيف الفصول، وبيانات أولياء الأمور</p>
          </div>
          <button className="btn btn-white text-primary fw-bold px-4 py-2" onClick={() => setShowModal(true)}>
             <FontAwesomeIcon icon={faPlus} className="me-2" /> تسجيل طالب جديد
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
           <div className="row g-2">
              <div className="col-md-8">
                 <div className="input-group">
                    <span className="input-group-text bg-light border-0"><FontAwesomeIcon icon={faSearch} className="text-muted" /></span>
                    <input 
                       type="text" 
                       className="form-control bg-light border-0" 
                       placeholder="ابحث بالاسم أو الرقم الأكاديمي..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>
              <div className="col-md-4">
                 <div className="input-group">
                    <span className="input-group-text bg-light border-0"><FontAwesomeIcon icon={faFilter} className="text-muted" /></span>
                    <select className="form-select bg-light border-0" value={selectedGrade} onChange={(e)=>setSelectedGrade(e.target.value)}>
                       <option value="">جميع الصفوف</option>
                       {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light bg-opacity-10 text-muted small">
              <tr>
                <th className="ps-4">الطالب</th>
                <th>البيانات الأكاديمية</th>
                <th>ولي الأمر</th>
                <th>الحالة</th>
                <th className="text-center pe-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan="5" className="text-center py-5"><div className="spinner-primary"></div></td></tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div className="avatar bg-primary bg-opacity-10 text-primary me-3">
                          {s.name[0]}
                        </div>
                        <div>
                           <div className="fw-bold">{s.name}</div>
                           <div className="text-muted small">#{s.student_code}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                       <div className="fw-bold text-primary">{s.grade_name || 'الصف'}</div>
                       <div className="text-muted small">فصل: {s.class_name || '--'}</div>
                    </td>
                    <td className="small">
                       <div className="d-flex align-items-center gap-2">
                          <FontAwesomeIcon icon={faPhone} className="text-success" size="xs" />
                          <span>{s.parent_phone}</span>
                       </div>
                       <div className="text-muted" style={{ fontSize: 10 }}>رقم ولي الأمر المعتمد</div>
                    </td>
                    <td>
                      <span className="badge badge-active"><FontAwesomeIcon icon={faCircleCheck} className="me-1" /> نشط</span>
                    </td>
                    <td className="text-center pe-4">
                      <div className="d-flex justify-content-center gap-1">
                        <button className="btn btn-icon btn-sm btn-light" title="تعديل"><FontAwesomeIcon icon={faEdit} /></button>
                        <button className="btn btn-icon btn-sm btn-light text-danger" title="حذف"><FontAwesomeIcon icon={faTrash} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted">لا يوجد طلاب مطابقون للبحث</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="modal-header border-0 pb-0 px-4 pt-4">
                <h5 className="modal-title fw-bold">تسجيل ملف طالب جديد</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddStudent}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-12">
                       <div className="alert alert-info py-2 small d-flex align-items-center gap-2">
                          <FontAwesomeIcon icon={faUserShield} />
                          سيتم إنشاء حساب دخول تلقائي للطالب باستخدام الإيميل وكلمة مرور افتراضية.
                       </div>
                    </div>
                    <div className="col-md-6 text-start">
                      <label className="form-label small fw-bold">اسم الطالب الرباعي</label>
                      <input type="text" name="name" className="form-control bg-light border-0" required value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-3 text-start">
                      <label className="form-label small fw-bold">الجنس</label>
                      <select name="gender" className="form-select bg-light border-0" value={formData.gender} onChange={handleInputChange}>
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                      </select>
                    </div>
                    <div className="col-md-3 text-start">
                      <label className="form-label small fw-bold">الرقم الأكاديمي</label>
                      <input type="text" name="student_code" className="form-control bg-light border-0" required value={formData.student_code} onChange={handleInputChange} placeholder="S-0001" />
                    </div>
                    
                    <div className="col-md-6 text-start">
                      <label className="form-label small fw-bold">الصف الدراسي</label>
                      <select name="grade_level_id" className="form-select bg-light border-0" required value={formData.grade_level_id} onChange={handleInputChange}>
                        <option value="">اختر الصف...</option>
                        {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6 text-start">
                      <label className="form-label small fw-bold">الفصل (الشعبة)</label>
                      <select name="class_id" className="form-select bg-light border-0" required value={formData.class_id} onChange={handleInputChange}>
                        <option value="">اختر الفصل...</option>
                        {classes.filter(c => c.grade_level_id == formData.grade_level_id).map(c => (
                           <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-md-6 text-start">
                      <label className="form-label small fw-bold">رقم هاتف ولي الأمر (للمزامنة)</label>
                      <input type="text" name="parent_phone" className="form-control bg-light border-0" required value={formData.parent_phone} onChange={handleInputChange} placeholder="7xxxxxxxx" />
                    </div>
                    <div className="col-md-6 text-start">
                       <label className="form-label small fw-bold">الإيميل (اختياري)</label>
                       <input type="email" name="email" className="form-control bg-light border-0" value={formData.email} onChange={handleInputChange} placeholder="student@school.com" />
                    </div>

                    <div className="col-12 text-start">
                      <label className="form-label small fw-bold">عنوان السكن</label>
                      <input type="text" name="address" className="form-control bg-light border-0" value={formData.address} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>إغلاق</button>
                  <button type="submit" className="btn btn-primary px-5">إتمام التسجيل</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
