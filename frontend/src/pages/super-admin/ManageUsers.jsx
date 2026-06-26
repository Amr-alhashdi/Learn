import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faPlus, faEdit, faTrash, faSearch,
  faTimes, faSave, faLock, faUserShield, faUser,
  faChalkboardTeacher, faGraduationCap, faUserTie
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const ROLE_MAP = {
  super_admin:  { label: 'مدير عام',      icon: faUserShield,       color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
  school_admin: { label: 'مدير مدرسة',    icon: faUserTie,          color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  teacher:      { label: 'معلم',           icon: faChalkboardTeacher, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  student:      { label: 'طالب',           icon: faGraduationCap,    color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  parent:       { label: 'ولي أمر',        icon: faUser,             color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
};

const emptyForm = {
  name: '', email: '', phone: '', password: '', role: 'school_admin', is_active: 1
};

const ManageUsers = () => {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [search, setSearch]       = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/super-admin/users?page=${page}&per_page=15`);
      setUsers(res.data?.data || []);
      setPagination(res.data?.pagination || null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleInput = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
  };

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (u) => {
    setEditId(u.id);
    setForm({ name: u.name || '', email: u.email || '', phone: u.phone || '', password: '', role: u.role || 'school_admin', is_active: u.is_active });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editId) {
        await axiosInstance.put(`/super-admin/users/${editId}`, payload);
        Swal.fire({ title: 'تم التحديث', icon: 'success', timer: 1800, showConfirmButton: false });
      } else {
        await axiosInstance.post('/super-admin/users', payload);
        Swal.fire({ title: 'تمت الإضافة', icon: 'success', timer: 1800, showConfirmButton: false });
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      Swal.fire({ title: 'خطأ', text: err.response?.data?.message || 'حدث خطأ', icon: 'error' });
    } finally { setSaving(false); }
  };

  const handleDelete = (user) => {
    Swal.fire({
      title: 'حذف المستخدم؟',
      html: `سيتم حذف <strong>${user.name}</strong> نهائياً!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'حذف', cancelButtonText: 'إلغاء',
      confirmButtonColor: '#EF4444',
    }).then(async (res) => {
      if (!res.isConfirmed) return;
      try {
        await axiosInstance.delete(`/super-admin/users/${user.id}`);
        Swal.fire({ title: 'تم الحذف', icon: 'success', timer: 1500, showConfirmButton: false });
        fetchUsers();
      } catch (err) {
        Swal.fire({ title: 'خطأ', text: err.response?.data?.message || 'فشل الحذف', icon: 'error' });
      }
    });
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>إدارة النظام</div>
              <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, margin: 0 }}>إدارة المستخدمين</h2>
              <p style={{ opacity: 0.8, marginTop: 6, marginBottom: 0, fontSize: 14 }}>
                {pagination?.total ?? users.length} مستخدم في النظام
              </p>
            </div>
            <button className="btn btn-sm d-flex align-items-center gap-2" onClick={openAdd}
              style={{ background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff' }}>
              <FontAwesomeIcon icon={faPlus} />
              <span>إضافة مستخدم</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Filter Chips */}
      <div className="d-flex gap-2 flex-wrap mb-3">
        <button
          onClick={() => setFilterRole('all')}
          className="btn btn-sm"
          style={{ borderRadius: 20, background: filterRole === 'all' ? 'var(--primary)' : 'var(--bg-card)', color: filterRole === 'all' ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border-color)' }}
        >
          الكل ({users.length})
        </button>
        {Object.entries(ROLE_MAP).map(([role, info]) => (
          <button key={role} onClick={() => setFilterRole(role)}
            className="btn btn-sm"
            style={{ borderRadius: 20, background: filterRole === role ? info.color : 'var(--bg-card)', color: filterRole === role ? '#fff' : 'var(--text-muted)', border: `1px solid ${filterRole === role ? info.color : 'var(--border-color)'}` }}
          >
            <FontAwesomeIcon icon={info.icon} className="me-1" />
            {info.label} {roleCounts[role] ? `(${roleCounts[role]})` : ''}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="search-bar mb-4">
        <FontAwesomeIcon icon={faSearch} style={{ color: 'var(--text-muted)' }} />
        <input placeholder="ابحث بالاسم أو البريد الإلكتروني..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><FontAwesomeIcon icon={faTimes} /></button>}
      </div>

      {/* Table */}
      <div className="card" style={{ border: 'none', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th style={{ paddingRight: '1.5rem' }}>#</th>
                <th>المستخدم</th>
                <th>الدور</th>
                <th>التواصل</th>
                <th>الحالة</th>
                <th>آخر دخول</th>
                <th className="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-5">
                  <div className="spinner-primary mx-auto"></div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7">
                  <div className="empty-state">
                    <FontAwesomeIcon icon={faUsers} style={{ fontSize: '3rem', opacity: 0.2, display: 'block', marginBottom: '1rem' }} />
                    <div style={{ fontWeight: 700 }}>لا توجد نتائج</div>
                  </div>
                </td></tr>
              ) : filtered.map((u, idx) => {
                const roleInfo = ROLE_MAP[u.role] || { label: u.role, color: '#gray', bg: '#eee' };
                return (
                  <tr key={u.id}>
                    <td style={{ paddingRight: '1.5rem', color: 'var(--text-muted)', fontSize: 13 }}>{idx + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="avatar" style={{ background: roleInfo.bg, color: roleInfo.color, fontFamily: 'Cairo', fontWeight: 800 }}>
                          {u.name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                          <div className="text-muted" style={{ fontSize: 11 }}>#{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: roleInfo.bg, color: roleInfo.color,
                        padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700
                      }}>
                        <FontAwesomeIcon icon={roleInfo.icon} />
                        {roleInfo.label}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <div>{u.email || '—'}</div>
                      <div className="text-muted">{u.phone || ''}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {u.is_active ? 'مفعّل' : 'معطّل'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {u.last_login ? new Date(u.last_login).toLocaleDateString('ar') : 'لم يسجل بعد'}
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-1">
                        <button className="btn btn-icon btn-sm btn-outline-primary" onClick={() => openEdit(u)} title="تعديل">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className="btn btn-icon btn-sm btn-outline-danger" onClick={() => handleDelete(u)} title="حذف">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pagination && pagination.last_page > 1 && (
          <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="text-muted" style={{ fontSize: 13 }}>صفحة {pagination.current_page} من {pagination.last_page}</div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-primary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>السابق</button>
              <button className="btn btn-sm btn-outline-primary" disabled={page >= pagination.last_page} onClick={() => setPage(p => p + 1)}>التالي</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header d-flex justify-content-between align-items-center">
                <div>
                  <div className="modal-title">{editId ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}</div>
                  <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
                    {editId ? 'اترك كلمة المرور فارغة إن لم تريد تغييرها' : 'أدخل بيانات المستخدم الجديد'}
                  </div>
                </div>
                <button className="btn btn-icon" onClick={() => setShowModal(false)} style={{ background: 'var(--bg-body)', color: 'var(--text-muted)' }}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">الاسم الكامل <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <input type="text" className="form-control" name="name" required value={form.name} onChange={handleInput} placeholder="الاسم الرباعي" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">البريد الإلكتروني</label>
                      <input type="email" className="form-control" name="email" value={form.email} onChange={handleInput} placeholder="user@example.com" dir="ltr" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">رقم الهاتف</label>
                      <input type="tel" className="form-control" name="phone" value={form.phone} onChange={handleInput} placeholder="777 000 000" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        <FontAwesomeIcon icon={faLock} className="me-1" />
                        كلمة المرور {!editId && <span style={{ color: 'var(--danger)' }}>*</span>}
                      </label>
                      <input type="password" className="form-control" name="password" required={!editId} value={form.password} onChange={handleInput} placeholder={editId ? 'اتركها فارغة للإبقاء' : 'أدخل كلمة مرور قوية'} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">الدور الوظيفي</label>
                      <select name="role" className="form-select" value={form.role} onChange={handleInput}>
                        {Object.entries(ROLE_MAP).map(([r, info]) => (
                          <option key={r} value={r}>{info.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <div className="d-flex align-items-center gap-2 p-3" style={{ background: 'var(--bg-body)', borderRadius: 'var(--radius-sm)' }}>
                        <input type="checkbox" className="form-check-input" name="is_active" id="isActive"
                          checked={!!form.is_active} onChange={handleInput} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                        <label htmlFor="isActive" style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                          الحساب مفعّل ويمكن للمستخدم تسجيل الدخول
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-sm" onClick={() => setShowModal(false)} style={{ background: 'var(--bg-body)', color: 'var(--text-muted)' }}>
                    إلغاء
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary d-flex align-items-center gap-2" disabled={saving}>
                    {saving ? <div className="spinner-border spinner-border-sm" /> : <FontAwesomeIcon icon={faSave} />}
                    <span>{editId ? 'حفظ التعديلات' : 'إضافة المستخدم'}</span>
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

export default ManageUsers;
