import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTasks, faClock, faCheckCircle, faCloudUploadAlt, faFileAlt, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axiosInstance.get('/student/assignments');
        setAssignments(res.data?.data || [
           { id: 1, title: 'حل تمارين المصفوفات ص 15', subject: 'الرياضيات', teacher: 'أحمد علي', status: 'pending', due: 'غداً، 12:00 م' },
           { id: 2, title: 'تقرير عن حركات الكواكب', subject: 'الفيزياء', teacher: 'خالد عمر', status: 'submitted', due: '20 يونيو' },
           { id: 3, title: 'تلخيص الوحدة الأولى', subject: 'اللغة العربية', teacher: 'مريم يوسف', status: 'pending', due: '25 يونيو' },
        ]);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchAssignments();
  }, []);

  const handleSubmitAssignment = (id) => {
     Swal.fire({
        title: 'تسليم الواجب',
        text: 'يرجى اختيار ملف الحل (PDF أو صورة)',
        input: 'file',
        showCancelButton: true,
        confirmButtonText: 'تسليم الآن',
        cancelButtonText: 'إلغاء'
     });
  };

  return (
    <div>
      <div className="page-hero mb-4" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
        <div>
          <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>التكاليف والمهام الدراسية</h2>
          <p className="mb-0 opacity-80 small">متابعة الواجبات المسندة من المعلمين ورفع الحلول للمراجعة</p>
        </div>
      </div>

      {loading ? (
         <div className="text-center py-5"><div className="spinner-primary"></div></div>
      ) : (
        <div className="row g-4 animate-in">
           {assignments.map(a => (
              <div className="col-12" key={a.id}>
                 <div className="card shadow-sm border-0 border-start border-4 border-primary">
                    <div className="card-body p-4">
                       <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                             <div className="badge bg-light text-primary mb-2">{a.subject}</div>
                             <h5 className="fw-bold mb-1">{a.title}</h5>
                             <div className="text-muted small">المعلم: {a.teacher}</div>
                          </div>
                          <div className={`badge ${a.status === 'pending' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-success bg-opacity-10 text-success'}`}>
                             {a.status === 'pending' ? 'بانتظار التسليم' : 'تم التسليم بنجاح'}
                          </div>
                       </div>
                       
                       <div className="d-flex align-items-center justify-content-between mt-4">
                          <div className="d-flex align-items-center gap-2 small text-muted">
                             <FontAwesomeIcon icon={faClock} className="text-danger" />
                             <span>موعد التسليم: <span className="fw-bold">{a.due}</span></span>
                          </div>
                          <div className="d-flex gap-2">
                             {a.status === 'pending' ? (
                                <button onClick={() => handleSubmitAssignment(a.id)} className="btn btn-primary d-flex align-items-center gap-2">
                                   <FontAwesomeIcon icon={faCloudUploadAlt} />
                                   <span>تسليم الحل</span>
                                </button>
                             ) : (
                                <button className="btn btn-light d-flex align-items-center gap-2 text-success disabled">
                                   <FontAwesomeIcon icon={faCheckCircle} />
                                   <span>تم التسليم</span>
                                </button>
                             )}
                             <button className="btn btn-icon btn-light"><FontAwesomeIcon icon={faExternalLinkAlt} /></button>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
