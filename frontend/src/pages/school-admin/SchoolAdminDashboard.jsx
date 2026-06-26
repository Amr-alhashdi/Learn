import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding, faUsers, faChalkboardTeacher, faGraduationCap,
  faChartBar, faArrowTrendUp, faCalendarCheck, faBell
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const StatCard = ({ icon, label, value, color, bg, trend }) => (
  <div className="card h-100 border-0 shadow-sm">
    <div className="card-body d-flex align-items-center gap-3">
      <div className="stat-icon-box" style={{ background: bg, color }}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div>
        <div className="text-muted small fw-bold">{label}</div>
        <div className="h4 fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>{value}</div>
        {trend && <div className="text-success small"><FontAwesomeIcon icon={faArrowTrendUp} /> {trend}</div>}
      </div>
    </div>
  </div>
);

const SchoolAdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, attendance: '92%' });
  const [schoolInfo, setSchoolInfo] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosInstance.get('/school-admin/school');
        setSchoolInfo(res.data?.data);
        // Stats would come from a dashboard-specific endpoint usually
      } catch (e) { console.error(e); }
    };
    fetchDashboard();
  }, []);

  return (
    <div>
      <div className="page-hero mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>نظام إدارة المدرسة</div>
            <h2 className="fw-900" style={{ fontFamily: 'Cairo' }}>{schoolInfo?.name || 'لوحة تحكم المدير'}</h2>
            <p className="mb-0 opacity-80 small">مرحباً بك مجدداً في نظام إدارة مدرستك الذكية</p>
          </div>
          <div className="avatar-lg bg-white bg-opacity-10">
             <FontAwesomeIcon icon={faBuilding} size="2x" />
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <StatCard icon={faGraduationCap} label="إجمالي الطلاب" value="450" color="#6366F1" bg="rgba(99,102,241,0.1)" trend="+12 جديد" />
        </div>
        <div className="col-md-3">
          <StatCard icon={faChalkboardTeacher} label="المعلمين" value="32" color="#10B981" bg="rgba(16,185,129,0.1)" />
        </div>
        <div className="col-md-3">
          <StatCard icon={faCalendarCheck} label="نسبة الحضور اليوم" value="94%" color="#F59E0B" bg="rgba(245,158,11,0.1)" />
        </div>
        <div className="col-md-3">
          <StatCard icon={faBell} label="تنبيهات إدارية" value="5" color="#EF4444" bg="rgba(239,68,68,0.1)" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
           <div className="card h-100 border-0 shadow-sm">
              <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-3">
                 <h6 className="mb-0 fw-bold">نظرة عامة على الأداء</h6>
                 <button className="btn btn-sm btn-light">آخر 30 يوم</button>
              </div>
              <div className="card-body">
                 {/* Placeholder for Chart */}
                 <div style={{ height: '300px', background: 'var(--bg-body)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="text-center opacity-30">
                       <FontAwesomeIcon icon={faChartBar} size="3x" className="mb-2" />
                       <div>مساحة لعرض مخططات التحصيل الدراسي</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
        <div className="col-lg-4">
           <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-transparent py-3">
                 <h6 className="mb-0 fw-bold">إجراءات سريعة</h6>
              </div>
              <div className="card-body">
                 <div className="d-grid gap-2">
                    <Link to="/admin/students" className="btn btn-outline-primary text-start p-3 d-flex align-items-center gap-3">
                       <FontAwesomeIcon icon={faGraduationCap} /> إضافة طالب جديد
                    </Link>
                    <Link to="/admin/attendance" className="btn btn-outline-success text-start p-3 d-flex align-items-center gap-3">
                       <FontAwesomeIcon icon={faCalendarCheck} /> مراجعة الغياب اليومي
                    </Link>
                    <Link to="/admin/teachers" className="btn btn-outline-info text-start p-3 d-flex align-items-center gap-3">
                       <FontAwesomeIcon icon={faChalkboardTeacher} /> تعيين معلم جديد
                    </Link>
                 </div>
              </div>
           </div>
           
           <div className="card border-0 shadow-sm bg-primary text-white">
              <div className="card-body p-4">
                 <h6 className="fw-bold mb-3">توصية الذكاء الاصطناعي 🧠</h6>
                 <p className="small mb-0" style={{ opacity: 0.9 }}>
                    لوحظ تراجع في مستوى مادة "الرياضيات" للصف التاسع. نوصي بعقد اجتماع مع مدرسي المادة لتحسين طرق الشرح.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
