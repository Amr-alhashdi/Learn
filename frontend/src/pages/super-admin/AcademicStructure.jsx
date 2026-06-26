import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGraduationCap, faBook, faCloudUploadAlt, faPlus, faTrash,
  faEdit, faLayerGroup, faFilePdf, faSearch, faTimes, faSave,
  faFolderOpen, faCogs
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const AcademicStructure = () => {
  const [activeTab, setActiveTab] = useState('grades'); // grades, subjects, library
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Grades Management
  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/super-admin/grades');
      setGrades(res.data?.data || [
        { id: 1, name: 'الصف الأول الابتدائي', count: 0 },
        { id: 2, name: 'الصف الثاني الابتدائي', count: 0 },
        { id: 9, name: 'الصف التاسع', count: 1 }
      ]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'grades') fetchGrades();
    // other tabs would fetch their own data
  }, [activeTab]);

  const handleAddGrade = () => {
    Swal.fire({
      title: 'إضافة صف دراسي جديد',
      input: 'text',
      inputLabel: 'ادخل اسم الصف',
      inputPlaceholder: 'مثال: الصف الثالث الابتدائي',
      showCancelButton: true,
      confirmButtonText: 'إضافة',
      cancelButtonText: 'إلغاء',
      inputAttributes: { required: 'true' }
    }).then(async (res) => {
      if (res.isConfirmed && res.value) {
        // API call to add grade
        setGrades([...grades, { id: Date.now(), name: res.value, count: 0 }]);
        Swal.fire('تمت الإضافة!', '', 'success');
      }
    });
  };

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>الإدارة الأكاديمية المركزية</div>
              <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, margin: 0 }}>محتوى المناهج والهيكل التعليمي</h2>
              <p style={{ opacity: 0.8, marginTop: 6, marginBottom: 0, fontSize: 14 }}>
                إعداد الصفوف، المواد، والمحتوى التعليمي الموحد لجميع المدارس
              </p>
            </div>
            <div className="d-flex gap-2">
               <button className="btn btn-sm btn-light" style={{ borderRadius: 'var(--radius-sm)' }}>
                 <FontAwesomeIcon icon={faCogs} className="me-1" /> إعدادات عامة
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="card-body p-2">
          <div className="nav nav-pills nav-fill gap-2">
            {[
              { id: 'grades', label: 'الصفوف الدراسية', icon: faLayerGroup },
              { id: 'subjects', label: 'المواد الدراسية', icon: faBook },
              { id: 'library', label: 'المكتبة المركزية', icon: faFolderOpen },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-link d-flex align-items-center justify-content-center gap-2 py-3 ${activeTab === tab.id ? 'active' : ''}`}
                style={{
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  transition: '0.3s',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : 'var(--text-muted)'
                }}
              >
                <FontAwesomeIcon icon={tab.icon} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Content based on Tab */}
      <div className="animate-in">
        {activeTab === 'grades' && (
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm" style={{ background: 'var(--primary-light)', border: '2px dashed var(--primary) !important' }}>
                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center py-5">
                  <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-4 mb-3" style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faPlus} size="2x" />
                  </div>
                  <h5 className="fw-bold">إضافة صف جديد</h5>
                  <p className="small text-muted mb-4">أضف مرحلة تعليمية جديدة إلى النظام</p>
                  <button onClick={handleAddGrade} className="btn btn-primary px-4">ابدأ الآن</button>
                </div>
              </div>
            </div>
            
            {grades.map(grade => (
              <div className="col-md-4" key={grade.id}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="avatar-lg bg-info bg-opacity-10 text-info">
                        <FontAwesomeIcon icon={faGraduationCap} />
                      </div>
                      <div className="d-flex gap-1">
                        <button className="btn btn-icon btn-sm btn-light text-primary"><FontAwesomeIcon icon={faEdit} /></button>
                        <button className="btn btn-icon btn-sm btn-light text-danger"><FontAwesomeIcon icon={faTrash} /></button>
                      </div>
                    </div>
                    <h5 className="fw-bold mb-1">{grade.name}</h5>
                    <div className="text-muted small mb-4">يحتوي على {grade.count || 0} مدرسة مسجلة</div>
                    <div className="divider opacity-50"></div>
                    <button onClick={() => setActiveTab('subjects')} className="btn btn-sm btn-outline-primary w-100 mt-2">إدارة المواد</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="card border-0 shadow-sm overflow-hidden">
             <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-3">
               <h5 className="mb-0 fw-bold">المواد الدراسية (الترمين)</h5>
               <button className="btn btn-sm btn-primary">
                 <FontAwesomeIcon icon={faPlus} className="me-1" /> إضافة مادة
               </button>
             </div>
             <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th className="ps-4">المادة</th>
                        <th>الصف الدراسي</th>
                        <th>الترم</th>
                        <th>عدد الملخصات</th>
                        <th className="text-center pe-4">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan="5">
                          <div className="empty-state">
                            <FontAwesomeIcon icon={faBook} />
                            <div className="fw-bold h6">لا توجد مواد دراسية مضافة لهذه المرحلة</div>
                            <p className="small">ابدأ بإدخال المواد وتوزيعها على الأترام الدراسية</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'library' && (
           <div className="card border-0 shadow-sm">
             <div className="card-body p-5 text-center">
                <FontAwesomeIcon icon={faFolderOpen} size="4x" className="mb-4 text-muted opacity-20" />
                <h4 className="fw-bold">المكتبة المركزية للملخصات</h4>
                <p className="text-muted mx-auto" style={{ maxWidth: '500px' }}>
                  هذا القسم مخصص لرفع الملفات والملخصات والكتب الدراسية الموحدة التي يتم توزيعها تلقائياً على جميع المدارس المشتركة.
                </p>
                <button className="btn btn-primary mt-3">
                  <FontAwesomeIcon icon={faCloudUploadAlt} className="me-2" /> رفع محتوى جديد
                </button>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default AcademicStructure;
