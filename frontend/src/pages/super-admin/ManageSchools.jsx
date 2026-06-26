import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faEdit, faTrash, faSearch, faCity,
  faTimes, faSave, faEye, faMapMarkerAlt, faPhone, faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const CITIES = ['صنعاء', 'تعز', 'عدن', 'حضرموت', 'إب', 'الحديدة', 'ذمار', 'مأرب', 'حجة', 'أمانة العاصمة'];
const GRADES = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `الصف ${i + 1}` }));

const emptyForm = {
  name: '', name_en: '', email: '', phone: '', address: '',
  city: 'صنعاء', country: 'YE', website: '', founded_year: '',
  status: 'active'
};

const StatusBadge = ({ status }) => {
  const map = {
    active:    { label: 'نشط',    className: 'badge-active' },
    inactive:  { label: 'معطل',   className: 'badge-inactive' },
    suspended: { label: 'موقوف',  className: 'badge-pending' },
  };
  const s = map[status] || { label: status, className: '' };
  return <span className={`badge ${s.className}`}>{s.label}</span>;
};

const ManageSchools = () => {
  const [schools, setSchools]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/super-admin/schools?page=${page}&per_page=12`);
      setSchools(res.data?.data || []);
      setPagination(res.data?.pagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (school) => {
    setEditId(school.id);
    setForm({
      name: school.name || '', name_en: school.name_en || '',
      email: school.email || '', phone: school.phone || '',
      address: school.address || '', city: school.city || 'صنعاء',
      country: school.country || 'YE', website: school.website || '',
      founded_year: school.founded_year || '', status: school.status || 'active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await axiosInstance.put(`/super-admin/schools/${editId}`, form);
        Swal.fire({ title: 'تم التحديث', text: 'تم تحديث بيانات المدرسة بنجاح', icon: 'success', timer: 2000, showConfirmButton: false });
      } else {
        await axiosInstance.post('/super-admin/schools', form);
        Swal.fire({ title: 'تمت الإضافة', text: 'تم إضافة المدرسة بنجاح', icon: 'success', timer: 2000, showConfirmButton: false });
      }
      setShowModal(false);
      fetchSchools();
    } catch (err) {
      const msg = err.response?.data?.message || 'حدث خطأ ما';
      Swal.fire({ title: 'خطأ', text: msg, icon: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (school) => {
    Swal.fire({
      title: 'حذف المدرسة؟',
      html: `سيتم حذف <strong>${school.name}</strong> وجميع بياناتها نهائياً!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#EF4444',
    }).then(async (res) => {
      if (!res.isConfirmed) return;
      try {
        await axiosInstance.delete(`/super-admin/schools/${school.id}`);
        Swal.fire({ title: 'تم الحذف', icon: 'success', timer: 1500, showConfirmButton: false });
        fetchSchools();
      } catch (err) {
        Swal.fire({ title: 'خطأ', text: err.response?.data?.message || 'فشل الحذف', icon: 'error' });
      }
    });
  };

  const filtered = schools.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.city?.includes(searchTerm)
  );

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4, fontWeight: 500 }}>إدارة النظام</div>
              <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, margin: 0 }}>إدارة المدارس</h2>
              <p style={{ opacity: 0.8, marginTop: 6, marginBottom: 0, fontSize: 14 }}>
                {pagination?.total ?? schools.length} مدرسة مسجلة في المنظومة
              </p>
            </div>
            <button className="btn btn-sm d-flex align-items-center gap-2" onClick={openAdd}
              style={{ background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: 'var(--radius-sm)' }}>
              <FontAwesomeIcon icon={faPlus} />
              <span>إضافة مدرسة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar mb-4">
        <FontAwesomeIcon icon={faSearch} style={{ color: 'var(--text-muted)' }} />
        <input
          placeholder="ابحث بالاسم أو البريد أو المدينة..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="card" style={{ border: 'none', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th style={{ paddingRight: '1.5rem' }}>#</th>
                <th>المدرسة</th>
                <th>التواصل</th>
                <th>الموقع</th>
                <th>الحالة</th>
                <th>تاريخ الإضافة</th>
                <th className="text-center" style={{ paddingLeft: '1.5rem' }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-5">
                  <div className="spinner-primary mx-auto"></div>
                  <div className="text-muted mt-3" style={{ fontSize: 13 }}>جاري التحميل...</div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7">
                  <div className="empty-state">
                    <FontAwesomeIcon icon={faCity} style={{ fontSize: '3rem', opacity: 0.2, display: 'block', marginBottom: '1rem' }} />
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                      {searchTerm ? 'لا توجد نتائج مطابقة' : 'لا توجد مدارس بعد'}
                    </div>
                    <div style={{ fontSize: 13 }}>
                      {searchTerm ? 'جرّب البحث بكلمة مختلفة' : 'اضغط على إضافة مدرسة للبدء'}
                    </div>
                  </div>
                </td></tr>
              ) : filtered.map((school, idx) => (
                <tr key={school.id}>
                  <td style={{ paddingRight: '1.5rem', color: 'var(--text-muted)', fontSize: 13 }}>
                    {(page - 1) * 12 + idx + 1}
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar" style={{
                        background: `hsl(${(school.id * 47) % 360}, 70%, 92%)`,
                        color: `hsl(${(school.id * 47) % 360}, 60%, 40%)`,
                        fontFamily: 'Cairo', fontWeight: 800
                      }}>
                        {school.name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{school.name}</div>
                        {school.name_en && <div className="text-muted" style={{ fontSize: 11 }}>{school.name_en}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12 }}>
                      {school.email && <div><FontAwesomeIcon icon={faEnvelope} className="me-1 text-muted" />{school.email}</div>}
                      {school.phone && <div><FontAwesomeIcon icon={faPhone} className="me-1 text-muted" />{school.phone}</div>}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12 }}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1 text-muted" />
                      {school.city || '—'}
                    </div>
                  </td>
                  <td><StatusBadge status={school.status} /></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {school.created_at ? new Date(school.created_at).toLocaleDateString('ar') : '—'}
                  </td>
                  <td className="text-center" style={{ paddingLeft: '1.5rem' }}>
                    <div className="d-flex justify-content-center gap-1">
                      <button className="btn btn-icon btn-sm btn-outline-primary" onClick={() => openEdit(school)} title="تعديل">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className="btn btn-icon btn-sm btn-outline-danger" onClick={() => handleDelete(school)} title="حذف">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="text-muted" style={{ fontSize: 13 }}>
              صفحة {pagination.current_page} من {pagination.last_page}
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-primary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                السابق
              </button>
              <button className="btn btn-sm btn-outline-primary" disabled={page >= pagination.last_page} onClick={() => setPage(p => p + 1)}>
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header d-flex justify-content-between align-items-center">
                <div>
                  <div className="modal-title">{editId ? 'تعديل بيانات المدرسة' : 'إضافة مدرسة جديدة'}</div>
                  <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
                    {editId ? 'قم بتحديث معلومات المدرسة' : 'أدخل بيانات المدرسة الجديدة'}
                  </div>
                </div>
                <button className="btn btn-icon" onClick={() => setShowModal(false)}
                  style={{ background: 'var(--bg-body)', color: 'var(--text-muted)' }}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Section: Basic Info */}
                  <div className="mb-3" style={{ background: 'var(--bg-body)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 14, color: 'var(--primary)', fontFamily: 'Cairo' }}>
                      <FontAwesomeIcon icon={faCity} className="me-2" />
                      المعلومات الأساسية
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">اسم المدرسة (عربي) <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input type="text" className="form-control" name="name" required value={form.name} onChange={handleInput} placeholder="مثال: مدرسة النهضة" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">اسم المدرسة (إنجليزي)</label>
                        <input type="text" className="form-control" name="name_en" value={form.name_en} onChange={handleInput} placeholder="School Name in English" dir="ltr" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">البريد الإلكتروني</label>
                        <input type="email" className="form-control" name="email" value={form.email} onChange={handleInput} placeholder="school@example.com" dir="ltr" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">رقم الهاتف</label>
                        <input type="tel" className="form-control" name="phone" value={form.phone} onChange={handleInput} placeholder="777 000 000" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">سنة التأسيس</label>
                        <input type="number" className="form-control" name="founded_year" value={form.founded_year} onChange={handleInput} min="1900" max="2030" placeholder="1990" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">الموقع الإلكتروني</label>
                        <input type="url" className="form-control" name="website" value={form.website} onChange={handleInput} placeholder="https://school.com" dir="ltr" />
                      </div>
                    </div>
                  </div>

                  {/* Section: Location */}
                  <div className="mb-3" style={{ background: 'var(--bg-body)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 14, color: 'var(--success)', fontFamily: 'Cairo' }}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                      الموقع الجغرافي
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">المدينة</label>
                        <select name="city" className="form-select" value={form.city} onChange={handleInput}>
                          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">الحالة</label>
                        <select name="status" className="form-select" value={form.status} onChange={handleInput}>
                          <option value="active">نشط</option>
                          <option value="inactive">معطل</option>
                          <option value="suspended">موقوف</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">العنوان التفصيلي</label>
                        <input type="text" className="form-control" name="address" value={form.address} onChange={handleInput} placeholder="الحي / الشارع / المبنى" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-sm" onClick={() => setShowModal(false)}
                    style={{ background: 'var(--bg-body)', color: 'var(--text-muted)' }}>
                    إلغاء
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary d-flex align-items-center gap-2" disabled={saving}>
                    {saving ? <div className="spinner-border spinner-border-sm" /> : <FontAwesomeIcon icon={faSave} />}
                    <span>{editId ? 'حفظ التعديلات' : 'إضافة المدرسة'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSchools;
