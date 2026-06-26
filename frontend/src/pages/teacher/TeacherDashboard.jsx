import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChalkboardTeacher, faSchool, faUsers, faBookOpen,
  faCalendarCheck, faChartLine, faClock, faStar,
  faTriangleExclamation, faLightbulb, faBrain
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const StatCard = ({ icon, label, value, color, bg }) => (
  <div className="card h-100 border-0 shadow-sm transition-hover">
    <div className="card-body p-4 d-flex align-items-center gap-3">
      <div className="stat-icon-box" style={{ background: bg, color }}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div>
        <div className="text-muted small fw-bold">{label}</div>
        <div className="h4 fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>{value}</div>
      </div>
    </div>
  </div>
);

const TeacherDashboard = () => {
  const [stats] = useState({ schools: 2, classes: 5, students: 164, subjects: 3 });

  return (
    <div>
      <div className="page-hero mb-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>بوابة المعلم الذكية</div>
            <h2 className="fw-900 mb-1" style={{ fontFamily: 'Cairo' }}>أهلاً بك، أستاذ أحمد</h2>
            <p className="mb-0 opacity-80 small">لديك اليوم 3 حصص دراسية مجدولة. نتمنى لك يوماً تعليمياً موفقاً!</p>
          </div>
          <div className="avatar-lg bg-white bg-opacity-10 animate-bounce-subtle">
             <FontAwesomeIcon icon={faChalkboardTeacher} size="2x" />
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <StatCard icon={faSchool} label="المدارس" value={stats.schools} color="#6366F1" bg="rgba(99,102,241,0.1)" />
        </div>
        <div className="col-md-3">
          <StatCard icon={faUsers} label="إجمالي الطلاب" value={stats.students} color="#10B981" bg="rgba(16,185,129,0.1)" />
        </div>
        <div className="col-md-3">
          <StatCard icon={faCalendarCheck} label="حصص اليوم" value="3" color="#F59E0B" bg="rgba(245,158,11,0.1)" />
        </div>
        <div className="col-md-3">
          <StatCard icon={faStar} label="تقييم الطلاب" value="4.8" color="#EF4444" bg="rgba(239,68,68,0.1)" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
           <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-transparent border-bottom py-3 d-flex justify-content-between align-items-center">
                 <h6 className="mb-0 fw-bold"><FontAwesomeIcon icon={faClock} className="me-2 text-primary" /> جدول الحصص اليومي</h6>
                 <button className="btn btn-sm btn-light">عرض الجدول الكامل</button>
              </div>
              <div className="card-body p-0">
                 <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                       <thead className="bg-light small">
                          <tr>
                             <th className="ps-4">الحصة</th>
                             <th>الصف/الفصل</th>
                             <th>المادة</th>
                             <th>الوقت</th>
                             <th className="text-center pe-4">إجراء</th>
                          </tr>
                       </thead>
                       <tbody>
                          {[
                             { id: 1, period: 'الأولى', class: 'السابع (أ)', subject: 'الرياضيات', time: '08:00 - 08:45' },
                             { id: 2, period: 'الثانية', class: 'السابع (ب)', subject: 'الرياضيات', time: '08:50 - 09:35' },
                             { id: 3, period: 'الرابعة', class: 'الثامن (ج)', subject: 'العلوم', time: '10:40 - 11:25' },
                          ].map(h => (
                             <tr key={h.id}>
                                <td className="ps-4 fw-bold">{h.period}</td>
                                <td><span className="badge bg-light text-dark">{h.class}</span></td>
                                <td className="text-primary fw-bold">{h.subject}</td>
                                <td className="small text-muted">{h.time}</td>
                                <td className="text-center pe-4">
                                   <Link to="/teacher/attendance" className="btn btn-sm btn-primary">بدء التحضير</Link>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </div>

        <div className="col-lg-4">
           <div className="card border-0 shadow-sm bg-indigo-900 text-dark mb-4" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1) !important' }}>
              <div className="card-body p-4">
                 <div className="d-flex align-items-center gap-2 mb-3">
                    <FontAwesomeIcon icon={faBrain} className="text-primary" />
                    <h6 className="fw-bold mb-0">توصية الذكاء الاصطناعي</h6>
                 </div>
                 <p className="small text-muted mb-3">
                    "لوحظ أن طلاب الصف السابع (ب) يواجهون صعوبة في فهم وحدة المصفوفات. نوصي باستخدام العروض التقديمية المتاحة في المكتبة لتبسيط المفاهيم."
                 </p>
                 <Link to="/teacher/content" className="btn btn-sm btn-primary w-100 py-2">عرض المحتوى الموصى به</Link>
              </div>
           </div>

           <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent py-3">
                 <h6 className="mb-0 fw-bold">تنبيهات إدارية</h6>
              </div>
              <div className="card-body p-0">
                 <div className="p-3 border-bottom d-flex gap-3">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-warning mt-1" />
                    <div className="small">يجب اعتماد درجات اختبار شهر أكتوبر قبل نهاية غدٍ الخميس.</div>
                 </div>
                 <div className="p-3 d-flex gap-3">
                    <FontAwesomeIcon icon={faLightbulb} className="text-success mt-1" />
                    <div className="small">تم تحديث مقرر "الفيزياء" للفصل الدراسي الثاني، يرجى الاطلاع.</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
