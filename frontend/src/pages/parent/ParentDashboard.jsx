import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle, faChild, faChartPie, faCalendarCheck,
  faStar, faExclamationTriangle, faChevronLeft, faBell
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await axiosInstance.get('/parent/children');
        const data = res.data?.data || [
           { id: 10, name: 'أحمد محمد', grade: 'التاسع', school: 'النهضة الحديثة', avatar: null, performance: '85%', attendance: '98%' },
           { id: 11, name: 'خالد محمد', grade: 'السابع', school: 'النهضة الحديثة', avatar: null, performance: '72%', attendance: '92%' }
        ];
        setChildren(data);
        setSelectedChild(data[0]);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchChildren();
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-primary"></div></div>;

  return (
    <div>
      <div className="page-hero mb-4" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>لوحة متابعة ولي الأمر</h2>
            <p className="mb-0 opacity-80 small">متابعة الأداء الأكاديمي، الحضور، وسلوك الأبناء في المدرسة</p>
          </div>
          <div className="avatar-lg bg-white bg-opacity-10">
             <FontAwesomeIcon icon={faChild} size="2x" />
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
           <h6 className="fw-bold mb-3">اختر الابن للمتابعة</h6>
           <div className="d-flex flex-column gap-2 mb-4">
              {children.map(child => (
                 <div 
                    key={child.student_id || child.id} 
                    onClick={() => setSelectedChild(child)}
                    className={`card border-0 shadow-sm transition-hover cursor-pointer ${(selectedChild?.student_id === child.student_id || selectedChild?.id === child.id) ? 'border-primary border-start border-4' : ''}`}
                 >
                    <div className="card-body p-3 d-flex align-items-center gap-3">
                       <div className="avatar bg-light text-primary">
                          <FontAwesomeIcon icon={faUserCircle} size="lg" />
                       </div>
                       <div className="flex-grow-1">
                          <div className="fw-bold small">{child.name}</div>
                          <div className="x-small text-muted">{child.grade} - {child.school}</div>
                       </div>
                       {selectedChild?.id === child.id && <FontAwesomeIcon icon={faChevronLeft} className="text-primary x-small" />}
                    </div>
                 </div>
              ))}
           </div>

           <div className="card border-0 shadow-sm bg-warning bg-opacity-10">
              <div className="card-body p-3">
                 <div className="d-flex gap-2">
                    <FontAwesomeIcon icon={faBell} className="text-warning mt-1" />
                    <div>
                       <h6 className="fw-bold x-small mb-1">تنبيهات ولي الأمر</h6>
                       <p className="x-small text-muted mb-0">تم اعتماد درجات شهر أكتوبر لمدرسة النهضة، يمكنك الاطلاع على النتائج الآن.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="col-lg-8">
           {selectedChild && (
              <div className="animate-in">
                 <div className="row g-3 mb-4">
                    <div className="col-md-4">
                       <div className="card text-center p-4 border-0 shadow-sm h-100">
                          <div className="stat-icon-box mx-auto mb-3 bg-primary bg-opacity-10 text-primary">
                             <FontAwesomeIcon icon={faChartPie} />
                          </div>
                          <div className="text-muted x-small fw-bold">التحصيل الدراسي</div>
                          <div className="h4 fw-900 mb-0">{selectedChild.performance}</div>
                       </div>
                    </div>
                    <div className="col-md-4">
                       <div className="card text-center p-4 border-0 shadow-sm h-100">
                          <div className="stat-icon-box mx-auto mb-3 bg-success bg-opacity-10 text-success">
                             <FontAwesomeIcon icon={faCalendarCheck} />
                          </div>
                          <div className="text-muted x-small fw-bold">نسبة الحضور</div>
                          <div className="h4 fw-900 mb-0">{selectedChild.attendance}</div>
                       </div>
                    </div>
                    <div className="col-md-4">
                       <div className="card text-center p-4 border-0 shadow-sm h-100">
                          <div className="stat-icon-box mx-auto mb-3 bg-warning bg-opacity-10 text-warning">
                             <FontAwesomeIcon icon={faStar} />
                          </div>
                          <div className="text-muted x-small fw-bold">السلوك والمشاركة</div>
                          <div className="h4 fw-900 mb-0">ممتاز</div>
                       </div>
                    </div>
                 </div>

                 <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-transparent border-bottom py-3 d-flex justify-content-between align-items-center">
                       <h6 className="mb-0 fw-bold">ملخص كشف المتابعة لهذا الأسبوع</h6>
                       <Link to="/parent/reports" className="btn btn-sm btn-link p-0 text-decoration-none">عرض التقارير التفصيلية</Link>
                    </div>
                    <div className="card-body p-0">
                       <div className="table-responsive">
                          <table className="table table-hover align-middle mb-0">
                             <thead className="bg-light small">
                                <tr>
                                   <th className="ps-4">التاريخ</th>
                                   <th>المادة</th>
                                   <th>الحضور</th>
                                   <th>المشاركة</th>
                                   <th>السلوك</th>
                                </tr>
                             </thead>
                             <tbody className="small">
                                <tr>
                                   <td className="ps-4">اليوم</td>
                                   <td className="fw-bold">الرياضيات</td>
                                   <td><span className="badge bg-success bg-opacity-10 text-success">حاضر</span></td>
                                   <td className="fw-bold">5/5</td>
                                   <td className="fw-bold">5/5</td>
                                </tr>
                                <tr>
                                   <td className="ps-4">أمس</td>
                                   <td className="fw-bold">الفيزياء</td>
                                   <td><span className="badge bg-success bg-opacity-10 text-success">حاضر</span></td>
                                   <td className="fw-bold">4/5</td>
                                   <td className="fw-bold">5/5</td>
                                </tr>
                                <tr>
                                   <td className="ps-4">15 يونيو</td>
                                   <td className="fw-bold">اللغة العربية</td>
                                   <td><span className="badge bg-danger bg-opacity-10 text-danger">غائب</span></td>
                                   <td>--</td>
                                   <td>--</td>
                                </tr>
                             </tbody>
                          </table>
                       </div>
                    </div>
                 </div>
                 
                 <div className="card border-0 shadow-sm bg-danger bg-opacity-10">
                    <div className="card-body p-4 d-flex align-items-center gap-3">
                       <div className="avatar bg-white text-danger">
                          <FontAwesomeIcon icon={faExclamationTriangle} />
                       </div>
                       <div>
                          <h6 className="fw-bold mb-1">ملاحظة من المعلم</h6>
                           <p className="small text-muted mb-0">"لقد تغيب {selectedChild.name} عن حصتين متتاليتين في مادة اللغة العربية، يرجى التواصل مع إدارة المدرسة."</p>
                       </div>
                    </div>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
