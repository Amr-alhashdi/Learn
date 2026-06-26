import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChalkboardTeacher, faPlus, faSearch, faEdit, faTrash,
  faEnvelope, faPhone, faGraduationCap, faCircleCheck, faBook
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', specialization: '', password: 'password'
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/school-admin/teachers');
      setTeachers(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/school-admin/teachers', formData);
      setShowModal(false);
      resetForm();
      fetchTeachers();
      Swal.fire('تم بنجاح', 'تم إضافة المعلم بنجاح', 'success');
    } catch (err) {
      Swal.fire('خطأ', err.response?.data?.message || 'فشل في إضافة المعلم', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', specialization: '', password: 'password' });
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-hero mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>إدارة هيئة التدريس</h2>
            <p className="mb-0 opacity-80">إضافة المعلمين، تحديد التخصصات، وإسناد المواد الدراسية</p>
          </div>
          <button className="btn btn-white text-primary fw-bold px-4 py-2" onClick={() => setShowModal(true)}>
             <FontAwesomeIcon icon={faPlus} className="me-2" /> إضافة معلم جديد
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
           <div className="input-group">
              <span className="input-group-text bg-light border-0"><FontAwesomeIcon icon={faSearch} className="text-muted" /></span>
              <input 
                 type="text" 
                 className="form-control bg-light border-0" 
                 placeholder="ابحث عن معلم بالاسم أو التخصص..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light bg-opacity-10 text-muted small">
              <tr>
                <th className="ps-4">المعلم</th>
                <th>التخصص التعليمي</th>
                <th>بيانات التواصل</th>
                <th>الحالة</th>
                <th className="text-center pe-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan="5" className="text-center py-5"><div className="spinner-primary"></div></td></tr>
              ) : filteredTeachers.length > 0 ? (
                filteredTeachers.map((t) => (
                  <tr key={t.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div className="avatar bg-success bg-opacity-10 text-success me-3">
                          {t.name[0]}
                        </div>
                        <div>
                           <div className="fw-bold">{t.name}</div>
                           <div className="text-muted small">كود: TEA-{t.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                       <div className="badge bg-light text-primary border d-inline-flex align-items-center gap-2">
                          <FontAwesomeIcon icon={faBook} size="xs" />
                          {t.specialization || 'غير محدد'}
                       </div>
                    </td>
                    <td className="small">
                       <div className="mb-1"><FontAwesomeIcon icon={faEnvelope} className="me-1 text-muted" /> {t.email}</div>
                       <div><FontAwesomeIcon icon={faPhone} className="me-1 text-muted" /> {t.phone}</div>
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
                <tr><td colSpan="5" className="text-center py-5 text-muted">لا يوجد معلمون مطابقون للبحث</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="modal-header border-0 pb-0 px-4 pt-4">
                <h5 className="modal-title fw-bold">إضافة معلم جديد للمدرسة</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddTeacher}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-12 text-start">
                      <label className="form-label small fw-bold">اسم المعلم الكامل</label>
                      <input type="text" name="name" className="form-control bg-light border-0" required value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-12 text-start">
                      <label className="form-label small fw-bold">التخصص (مثال: رياضيات، فيزياء)</label>
                      <input type="text" name="specialization" className="form-control bg-light border-0" required value={formData.specialization} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-12 text-start">
                      <label className="form-label small fw-bold">البريد الإلكتروني (للدخول)</label>
                      <input type="email" name="email" className="form-control bg-light border-0" required value={formData.email} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-12 text-start">
                      <label className="form-label small fw-bold">رقم الهاتف</label>
                      <input type="text" name="phone" className="form-control bg-light border-0" value={formData.phone} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>إغلاق</button>
                  <button type="submit" className="btn btn-primary px-5">إضافة المعلم</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeachers;
