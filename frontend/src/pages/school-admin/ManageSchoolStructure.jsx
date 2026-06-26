import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faLayerGroup, faUsers, faTag, faCogs, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const ManageSchoolStructure = () => {
  const [activeTab, setActiveTab] = useState('grades'); // grades, classes
  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStructure();
  }, [activeTab]);

  const fetchStructure = async () => {
    setLoading(true);
    try {
      if (activeTab === 'grades') {
        const res = await axiosInstance.get('/school-admin/grades');
        setGrades(res.data?.data || []);
      } else {
        const res = await axiosInstance.get('/school-admin/classes');
        setClasses(res.data?.data || []);
        // Also need grades for class creation
        const gRes = await axiosInstance.get('/school-admin/grades');
        setGrades(gRes.data?.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrade = () => {
    Swal.fire({
      title: 'إضافة صف دراسي جديد',
      input: 'text',
      inputLabel: 'اسم الصف (مثال: الصف التاسع)',
      showCancelButton: true,
      confirmButtonText: 'إضافة',
      cancelButtonText: 'إلغاء'
    }).then(async (res) => {
      if (res.isConfirmed && res.value) {
        try {
          await axiosInstance.post('/school-admin/grades', { name: res.value });
          fetchStructure();
          Swal.fire('تمت الإضافة', '', 'success');
        } catch (err) { Swal.fire('خطأ', 'فشل إجراء العملية', 'error'); }
      }
    });
  };

  const handleAddClass = () => {
    if (grades.length === 0) {
      return Swal.fire('تنبيه', 'يجب إضافة صف دراسي أولاً', 'warning');
    }

    Swal.fire({
      title: 'إضافة فصل/شعبة جديدة',
      html: `
        <div class="text-start mb-3">
          <label class="form-label small">اختر الصف</label>
          <select id="grade_id" class="form-select">
            ${grades.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
          </select>
        </div>
        <div class="text-start mb-3">
          <label class="form-label small">اسم الفصل (مثال: أ أو 1)</label>
          <input id="class_name" class="form-control" placeholder="أ">
        </div>
        <div class="text-start">
          <label class="form-label small">السعة القصوى</label>
          <input id="capacity" type="number" class="form-control" value="40">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'إضافة',
      focusConfirm: false,
      preConfirm: () => ({
        grade_id: document.getElementById('grade_id').value,
        name: document.getElementById('class_name').value,
        capacity: document.getElementById('capacity').value
      })
    }).then(async (res) => {
      if (res.isConfirmed && res.value.name) {
        try {
          await axiosInstance.post('/school-admin/classes', res.value);
          fetchStructure();
          Swal.fire('تمت الإضافة', '', 'success');
        } catch (err) { Swal.fire('خطأ', 'فشل إجراء العملية', 'error'); }
      }
    });
  };

  return (
    <div>
      <div className="page-hero mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>الهيكل التنظيمي للمدرسة</h2>
            <p className="mb-0 opacity-80">إدارة الصفوف الدراسية والفصول (الشعب)</p>
          </div>
          <div className="avatar-lg bg-white bg-opacity-10">
             <FontAwesomeIcon icon={faCogs} size="2x" />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-2">
           <div className="nav nav-pills nav-fill gap-2">
              <button onClick={() => setActiveTab('grades')} className={`nav-link py-3 gap-2 d-flex align-items-center justify-content-center ${activeTab === 'grades' ? 'active' : ''}`}>
                 <FontAwesomeIcon icon={faLayerGroup} /> <span>الصفوف الدراسية</span>
              </button>
              <button onClick={() => setActiveTab('classes')} className={`nav-link py-3 gap-2 d-flex align-items-center justify-content-center ${activeTab === 'classes' ? 'active' : ''}`}>
                 <FontAwesomeIcon icon={faUsers} /> <span>الفصول (الشعب)</span>
              </button>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-primary"></div></div>
      ) : (
        <div className="animate-in">
           {activeTab === 'grades' ? (
              <div className="row g-3">
                 <div className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm text-center p-4 border-dashed" onClick={handleAddGrade} style={{ cursor: 'pointer', border: '2px dashed var(--border-color) !important' }}>
                       <div className="stat-icon-box mx-auto mb-3 bg-primary bg-opacity-10 text-primary">
                          <FontAwesomeIcon icon={faPlus} />
                       </div>
                       <h6 className="fw-bold">إضافة صف دراسي</h6>
                       <p className="small text-muted mb-0">يمكنك إضافة مراحل تعليمية جديدة</p>
                    </div>
                 </div>
                 {grades.map(g => (
                    <div className="col-md-4" key={g.id}>
                       <div className="card border-0 shadow-sm h-100 p-4">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                             <div className="avatar bg-light text-primary fw-bold" style={{ width: 45, height: 45 }}>{g.name[0]}</div>
                             <div className="d-flex gap-1">
                                <button className="btn btn-icon btn-sm btn-light"><FontAwesomeIcon icon={faEdit} /></button>
                                <button className="btn btn-icon btn-sm btn-light text-danger"><FontAwesomeIcon icon={faTrash} /></button>
                             </div>
                          </div>
                          <h6 className="fw-bold mb-1">{g.name}</h6>
                          <div className="text-muted small">ترتيب الصف: {g.order_num || '--'}</div>
                       </div>
                    </div>
                 ))}
              </div>
           ) : (
              <div className="card border-0 shadow-sm overflow-hidden">
                 <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-3">
                    <h6 className="mb-0 fw-bold">قائمة الفصول الدراسية</h6>
                    <button className="btn btn-sm btn-primary" onClick={handleAddClass}>
                       <FontAwesomeIcon icon={faPlus} className="me-2" /> إضافة شعبة
                    </button>
                 </div>
                 <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                       <thead>
                          <tr>
                             <th className="ps-4">الفصل</th>
                             <th>الصف الدراسي</th>
                             <th>العام الأكاديمي</th>
                             <th>السعة</th>
                             <th className="text-center pe-4">إجراءات</th>
                          </tr>
                       </thead>
                       <tbody>
                          {classes.length > 0 ? classes.map(c => (
                             <tr key={c.id}>
                                <td className="ps-4 fw-bold text-primary">{c.name}</td>
                                <td>{c.grade_level_name || 'غير محدد'}</td>
                                <td>2024/2025</td>
                                <td>{c.capacity || 40} طالب</td>
                                <td className="text-center pe-4">
                                   <div className="d-flex justify-content-center gap-1">
                                      <button className="btn btn-icon btn-sm btn-light"><FontAwesomeIcon icon={faEdit} /></button>
                                      <button className="btn btn-icon btn-sm btn-light text-danger"><FontAwesomeIcon icon={faTrash} /></button>
                                   </div>
                                </td>
                             </tr>
                          )) : (
                             <tr><td colSpan="5" className="text-center py-5 text-muted">لا يوجد فصول دراسية حالياً</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           )}
        </div>
      )}
    </div>
  );
};

export default ManageSchoolStructure;
