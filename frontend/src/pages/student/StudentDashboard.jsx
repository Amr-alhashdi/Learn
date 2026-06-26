import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserGraduate, faBrain, faChartBar, faBookReader,
  faTasks, faCalendarAlt, faStar, faRocket,
  faArrowRight, faCircleCheck, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState(null);

  useEffect(() => {
    // Generate AI Insights simulation
    setTimeout(() => {
      setAiInsights({
        performance: 85,
        strengths: ['الرياضيات', 'الفيزياء'],
        weaknesses: ['اللغة الإنجليزية'],
        recommendation: 'نلاحظ تميزك في المواد العلمية، لكن مستواك في قواعد اللغة الإنجليزية يحتاج لتركيز أكبر. ننصحك بمشاهدة الدروس التفاعلية الجديدة في قسم المواد.'
      });
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div>
      <div className="page-hero mb-4" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>بوابة الطالب الذكية</div>
            <h2 className="fw-900 mb-1" style={{ fontFamily: 'Cairo' }}>أهلاً بك، محمد!</h2>
            <p className="mb-0 opacity-80 small">بناءً على تحليلاتنا الأخيرة، أنت تتقدم بشكل رائع في مسارك التعليمي.</p>
          </div>
          <div className="avatar-lg bg-white bg-opacity-20 text-white animate-pulse">
             <FontAwesomeIcon icon={faRocket} size="2x" />
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
           {/* AI Assessment Card */}
           <div className="card border-0 shadow-lg overflow-hidden mb-4" style={{ borderRadius: '24px' }}>
              <div className="card-body p-0">
                 <div className="row g-0">
                    <div className="col-md-5 p-4 bg-indigo-900 text-white d-flex flex-column justify-content-center" style={{ background: '#2e1065' }}>
                       <div className="d-flex align-items-center gap-2 mb-3">
                          <FontAwesomeIcon icon={faBrain} className="text-warning" />
                          <h5 className="fw-bold mb-0">تقييم الذكاء الاصطناعي</h5>
                       </div>
                       <div className="text-center my-4">
                          <div className="display-4 fw-900 mb-0">85%</div>
                          <div className="small opacity-70">مستوى الأداء العام</div>
                       </div>
                       <div className="progress bg-white bg-opacity-10" style={{ height: 8 }}>
                          <div className="progress-bar bg-warning" style={{ width: '85%' }}></div>
                       </div>
                    </div>
                    <div className="col-md-7 p-4 bg-white">
                       <h6 className="fw-bold mb-3">تحليل المسار التعليمي</h6>
                       {loading ? (
                          <div className="placeholder-glow">
                             <span className="placeholder col-12 mb-2"></span>
                             <span className="placeholder col-10 mb-2"></span>
                             <span className="placeholder col-8"></span>
                          </div>
                       ) : (
                          <div className="animate-in">
                             <p className="small text-muted mb-4">{aiInsights?.recommendation}</p>
                             <div className="row g-2 mb-4">
                                <div className="col-6">
                                   <div className="p-2 border rounded-3 bg-light">
                                      <div className="x-small fw-bold text-success mb-1">نقاط القوة</div>
                                      <div className="small fw-bold">{aiInsights?.strengths.join(', ')}</div>
                                   </div>
                                </div>
                                <div className="col-6">
                                   <div className="p-2 border rounded-3 bg-light">
                                      <div className="x-small fw-bold text-danger mb-1">تحتاج لتركيز</div>
                                      <div className="small fw-bold">{aiInsights?.weaknesses.join(', ')}</div>
                                   </div>
                                </div>
                             </div>
                             <Link to="/student/subjects" className="btn btn-outline-primary btn-sm w-100 rounded-pill">
                                عرض خطة التحسين الموصى بها <FontAwesomeIcon icon={faArrowRight} className="ms-1" size="xs" />
                             </Link>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           <div className="row g-3">
              <div className="col-md-6">
                 <div className="card h-100 border-0 shadow-sm transition-hover">
                    <div className="card-body p-4">
                       <div className="d-flex justify-content-between align-items-center mb-4">
                          <div className="avatar bg-primary bg-opacity-10 text-primary">
                             <FontAwesomeIcon icon={faTasks} />
                          </div>
                          <Link to="/student/assignments" className="btn btn-icon btn-light btn-sm"><FontAwesomeIcon icon={faArrowRight} /></Link>
                       </div>
                       <h6 className="fw-bold">التكاليف والواجبات</h6>
                       <p className="small text-muted mb-0">لديك 4 تكاليف جديدة بانتظار التسليم.</p>
                    </div>
                 </div>
              </div>
              <div className="col-md-6">
                 <div className="card h-100 border-0 shadow-sm transition-hover">
                    <div className="card-body p-4">
                       <div className="d-flex justify-content-between align-items-center mb-4">
                          <div className="avatar bg-success bg-opacity-10 text-success">
                             <FontAwesomeIcon icon={faBookReader} />
                          </div>
                          <Link to="/student/subjects" className="btn btn-icon btn-light btn-sm"><FontAwesomeIcon icon={faArrowRight} /></Link>
                       </div>
                       <h6 className="fw-bold">المواد الدراسية</h6>
                       <p className="small text-muted mb-0">تصفح الكتب، الملخصات، والمصادر الإثرائية.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="col-lg-4">
           {/* Recent Grades/Activity */}
           <div className="card border-0 shadow-sm mb-4 h-100">
              <div className="card-header bg-transparent py-3">
                 <h6 className="mb-0 fw-bold">آخر النتائج المحققة</h6>
              </div>
              <div className="card-body p-0">
                 {[
                    { sub: 'الرياضيات', grade: '19/20', desc: 'اختبار شهري', status: 'up' },
                    { sub: 'الفيزياء', grade: '18/20', desc: 'اختبار شهري', status: 'up' },
                    { sub: 'اللغة العربية', grade: '15/20', desc: 'أعمال سنة', status: 'down' },
                 ].map((g, i) => (
                    <div key={i} className="p-3 border-bottom d-flex align-items-center justify-content-between">
                       <div className="d-flex align-items-center gap-2">
                          <div className={`avatar sm ${g.status === 'up' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`} style={{ width: 32, height: 32 }}>
                             <FontAwesomeIcon icon={faStar} size="xs" />
                          </div>
                          <div>
                             <div className="fw-bold small">{g.sub}</div>
                             <div className="x-small text-muted">{g.desc}</div>
                          </div>
                       </div>
                       <div className="fw-bold text-primary">{g.grade}</div>
                    </div>
                 ))}
                 <div className="p-4 text-center">
                    <button className="btn btn-sm btn-light w-100">عرض كافة النتائج</button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
