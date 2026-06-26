import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCogs, faServer, faDatabase, faEnvelope, faGlobe, faHistory,
  faShieldAlt, faSave, faClock, faMicrochip, faToolbox, faCheckCircle,
  faSyncAlt
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = () => {
    Swal.fire({
      title: 'تم الحفظ',
      text: 'تم تحديث إعدادات النظام بنجاح',
      icon: 'success',
      confirmButtonText: 'حسناً'
    });
  };

  return (
    <div>
      <div className="page-hero" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>إدارة البنية التحتية</div>
          <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, margin: 0 }}>إعدادات النظام الأساسية</h2>
          <p style={{ opacity: 0.8, marginTop: 6, marginBottom: 0 }}>تكوين الخوادم، قواعد البيانات، والبريد الإلكتروني</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="card-body p-2">
              {[
                { id: 'general', label: 'الإعدادات العامة', icon: faCogs },
                { id: 'security', label: 'الأمان والخصوصية', icon: faShieldAlt },
                { id: 'email', label: 'خادم البريد (SMTP)', icon: faEnvelope },
                { id: 'backup', label: 'النسخ الاحتياطي', icon: faDatabase },
                { id: 'logs', label: 'سجلات النظام', icon: faHistory },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`btn w-100 text-start d-flex align-items-center gap-3 py-3 mb-1 border-0 ${activeTab === item.id ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
                  style={{ borderRadius: 'var(--radius-md)', fontWeight: 600 }}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-9 animate-in">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent py-4 px-4 border-bottom border-opacity-10">
              <h5 className="mb-0 fw-bold">
                {activeTab === 'general' && 'تكوين النظام العام'}
                {activeTab === 'security' && 'إعدادات الحماية والتشفير'}
                {activeTab === 'email' && 'إعدادات البريد الإلكتروني'}
                {activeTab === 'backup' && 'إدارة قواعد البيانات والنسخ الاحتياطي'}
                {activeTab === 'logs' && 'متابعة سجلات الأحداث'}
              </h5>
            </div>
            <div className="card-body p-4">
               {activeTab === 'general' && (
                 <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label">اسم النظام</label>
                      <input type="text" className="form-control" defaultValue="المدارس الذكية - Smart Schools" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">رابط الموقع (Base URL)</label>
                      <input type="url" className="form-control" defaultValue="https://smart-school.edu" dir="ltr" />
                    </div>
                    <div className="col-md-6">
                       <label className="form-label">المنطقة الزمنية</label>
                       <select className="form-select">
                          <option>Asia/Riyadh (GMT+3)</option>
                          <option>Asia/Aden (GMT+3)</option>
                          <option>UTC</option>
                       </select>
                    </div>
                    <div className="col-md-6">
                       <label className="form-label">اللغة الافتراضية</label>
                       <select className="form-select">
                          <option>العربية (Arabic)</option>
                          <option>الإنجليزية (English)</option>
                       </select>
                    </div>
                 </div>
               )}

               {activeTab === 'email' && (
                 <div className="row g-4">
                    <div className="col-12 p-3 bg-info bg-opacity-10 text-info rounded-3 small mb-2">
                       يُستخدم هذا الخادم لإرسال إشعارات الطلاب، تقارير أولياء الأمور، وطلبات استعادة كلمة المرور.
                    </div>
                    <div className="col-md-8">
                       <label className="form-label">SMTP Host</label>
                       <input type="text" className="form-control" placeholder="smtp.gmail.com" dir="ltr" />
                    </div>
                    <div className="col-md-4">
                       <label className="form-label">Port</label>
                       <input type="text" className="form-control" placeholder="587" dir="ltr" />
                    </div>
                    <div className="col-md-6">
                       <label className="form-label">Username</label>
                       <input type="text" className="form-control" placeholder="admin@domain.com" dir="ltr" />
                    </div>
                    <div className="col-md-6">
                       <label className="form-label">Password</label>
                       <input type="password" password="true" className="form-control" placeholder="••••••••" dir="ltr" />
                    </div>
                 </div>
               )}

               {activeTab === 'backup' && (
                  <div>
                     <div className="row g-4 mb-4">
                        <div className="col-md-6">
                           <div className="p-3 border rounded-3 text-center">
                              <FontAwesomeIcon icon={faDatabase} size="2x" className="mb-2 text-primary opacity-50" />
                              <div className="fw-bold mb-1">جدولة النسخ التلقائي</div>
                              <select className="form-select form-select-sm">
                                 <option>يومياً (الساعة 3 صباحاً)</option>
                                 <option>أسبوعياً (كل جمعة)</option>
                                 <option>يدوي فقط</option>
                              </select>
                           </div>
                        </div>
                        <div className="col-md-6">
                           <div className="p-3 border rounded-3 text-center h-100 d-flex flex-column justify-content-center">
                              <div className="fw-bold mb-2">آخر نسخة احتياطية</div>
                              <div className="text-muted small">منذ 14 ساعة (120 MB)</div>
                              <div className="mt-2 text-success"><FontAwesomeIcon icon={faCheckCircle} className="me-1" /> سليم</div>
                           </div>
                        </div>
                     </div>
                     <button className="btn btn-outline-primary w-100 py-3">
                        <FontAwesomeIcon icon={faSyncAlt} className="me-2" /> إبدأ عملية النسخ الاحتياطي الآن
                     </button>
                  </div>
               )}

               <div className="divider mt-5"></div>
               <div className="d-flex justify-content-end">
                  <button className="btn btn-primary px-5 py-3" onClick={handleSave}>
                     <FontAwesomeIcon icon={faSave} className="me-2" /> حفظ كافة التغييرات
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
