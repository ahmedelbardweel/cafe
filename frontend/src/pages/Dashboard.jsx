import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../api';
import MenuManagement from '../components/MenuManagement';

const STATUS_LABEL = {
  available: 'متاحة',
  busy: 'مشغولة',
  pending_payment: 'بانتظار الدفع'
};

const STATUS_COLOR = {
  available: '#10b981',
  busy: '#3b82f6',
  pending_payment: '#f59e0b'
};

function TableDetailsModal({ table, onClose, onToggleItem, onRelease, onMove, allTables }) {
  if (!table) return null;
  const orderItems = table.current_session?.items || [];
  const totalPrice = orderItems.reduce((sum, item) => sum + (item.quantity * (item.menu_item?.price || 0)), 0);
  const [toggling, setToggling] = useState(null);
  const [moving, setMoving] = useState(false);
  const [targetTableId, setTargetTableId] = useState('');

  const handleToggle = async (itemId) => {
    setToggling(itemId);
    await onToggleItem(itemId);
    setToggling(null);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/table/${table.uuid}`;
  const availableTables = allTables.filter(t => t.status === 'available' && t.id !== table.id);

  return (
    <div className="bottom-sheet-overlay" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0, zIndex: 1000 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bottom-sheet" style={{ maxWidth: 800, width: '100%', borderRadius: '24px 24px 0 0', overflow: 'hidden', boxShadow: '0 -20px 40px rgba(0,0,0,0.2)', background: '#fff', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ padding: '24px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
          <div className="flex items-center gap-4">
            <div style={{ width: 48, height: 48, background: 'var(--color-primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons-round text-primary" style={{ fontSize: 28 }}>restaurant</span>
            </div>
            <div>
              <h3 className="font-black text-2xl leading-none">طاولة {table.table_number}</h3>
              <div className="text-sm text-secondary mt-2 font-bold">جلسة نشطة • {orderItems.length} أصناف</div>
            </div>
          </div>
          <button className="btn btn-ghost" style={{ width: 40, height: 40, padding: 0, borderRadius: '50%' }} onClick={onClose}><span className="material-icons-round">close</span></button>
        </div>

        {/* Move Session Section */}
        {moving && (
          <div style={{ background: '#f8fafc', padding: '20px 30px', borderBottom: '1px solid #e2e8f0' }}>
            <div className="flex items-center gap-3">
              <select 
                className="form-control" 
                style={{ flex: 1, borderRadius: '8px', height: 46, fontWeight: 'bold', fontSize: '1rem', padding: '0 16px', border: '1px solid #cbd5e1' }}
                value={targetTableId}
                onChange={(e) => setTargetTableId(e.target.value)}
              >
                <option value="">اختر الطاولة الهدف...</option>
                {availableTables.map(t => (
                  <option key={t.id} value={t.id}>نقل إلى طاولة #{t.table_number}</option>
                ))}
              </select>
              <button 
                className="btn btn-primary" 
                style={{ borderRadius: '8px', height: 46, padding: '0 24px', fontSize: '1rem' }}
                disabled={!targetTableId}
                onClick={() => onMove(table.id, targetTableId)}
              >تأكيد النقل</button>
              <button className="btn btn-ghost" style={{ borderRadius: '8px', height: 46 }} onClick={() => setMoving(false)}>إلغاء</button>
            </div>
          </div>
        )}

        <div className="modal-body" style={{ overflowY: 'auto', padding: 0, flex: 1, background: '#f8fafc' }}>
          {/* QR & Info Area */}
          <div style={{ padding: '30px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: '#fff', padding: 16, border: '2px solid #e2e8f0', borderRadius: '16px', display: 'inline-block', marginBottom: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
              <img src={qrUrl} alt="Table QR" style={{ width: 180, height: 180, display: 'block' }} />
            </div>
            <div className="text-sm font-black text-primary uppercase tracking-tighter mb-4">امسح الرمز لطلب الطعام</div>
            <a href={qrUrl} download={`table-${table.table_number}-qr.png`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ borderRadius: '50px', border: '2px solid var(--color-primary)', color: 'var(--color-primary)', fontWeight: 800, padding: '8px 24px' }}>
              <span className="material-icons-round">download</span>
              تحميل الـ QR
            </a>
          </div>

          <div style={{ padding: '30px' }}>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black text-lg flex items-center gap-2 text-slate-800">
                <span className="material-icons-round text-primary" style={{ fontSize: 24 }}>format_list_bulleted</span>
                محتويات الطلب
              </h4>
              <div className="badge" style={{ background: 'var(--color-primary)', color: '#fff', fontSize: '13px', padding: '6px 14px', borderRadius: '50px' }}>
                {orderItems.filter(i => i.is_prepared).length} من {orderItems.length} جاهز
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orderItems.length > 0 ? (
                orderItems.map((item) => (
                  <label key={item.id} className={`order-item-row ${item.is_prepared ? 'is-done' : ''} ${toggling === item.id ? 'is-loading' : ''}`} style={{ cursor: 'pointer', borderRadius: '12px' }}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="qty-badge" style={{ borderRadius: '8px', width: 44, height: 44, fontSize: '18px' }}>{item.quantity}</div>
                      <div>
                        <div className="item-name" style={{ fontSize: '1.2rem' }}>{item.menu_item?.name || 'صنف غير معروف'}</div>
                        <div className="item-price-sub" style={{ fontSize: '1rem', marginTop: 4 }}>₪{item.menu_item?.price || 0} للواحد</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-left">
                        <div className="item-total-price" style={{ fontSize: '1.4rem' }}>₪{(item.quantity * (item.menu_item?.price || 0)).toFixed(2)}</div>
                      </div>
                      <div className="custom-checkbox" style={{ position: 'relative', width: 32, height: 32 }}>
                        {toggling === item.id ? (
                          <div className="spinner" style={{ width: 24, height: 24, borderTopColor: 'var(--color-primary)', margin: 4 }}></div>
                        ) : (
                          <>
                            <input 
                              type="checkbox" 
                              checked={!!item.is_prepared} 
                              onChange={() => handleToggle(item.id)}
                              style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer', zIndex: 2 }}
                            />
                            <div style={{ 
                              width: '100%', height: '100%', border: `2px solid ${item.is_prepared ? 'var(--color-success)' : '#cbd5e1'}`, 
                              borderRadius: '8px', background: item.is_prepared ? 'var(--color-success)' : '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                            }}>
                              {item.is_prepared && <span className="material-icons-round" style={{ color: '#fff', fontSize: 20 }}>check</span>}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-center py-12" style={{ background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                  <span className="material-icons-round text-slate-200" style={{ fontSize: 64 }}>inventory_2</span>
                  <p className="text-lg font-bold text-secondary mt-4">لا توجد طلبات نشطة</p>
                </div>
              )}
            </div>

            {/* Total Footer */}
            {orderItems.length > 0 && (
              <div className="total-box-kitchen" style={{ borderRadius: '16px' }}>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold opacity-90 text-white">المجموع الإجمالي المطلوب</span>
                  <span className="text-4xl font-black text-white">₪{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white flex gap-3" style={{ borderTop: '1px solid #e2e8f0', padding: '20px 30px' }}>
          <button className="btn btn-ghost flex-1 kitchen-btn" style={{ color: '#ef4444', border: '2px solid #fee2e2', borderRadius: '12px', background: '#fef2f2' }} onClick={() => {
            if (window.confirm('هل أنت متأكد من رغبتك في إغلاق هذه الطاولة وتصفير الجلسة؟')) onRelease(table.id);
          }}>
            <span className="material-icons-round" style={{ fontSize: 24 }}>no_meals</span>
            إغلاق الطاولة
          </button>
          
          <button className="btn btn-ghost flex-1 kitchen-btn" style={{ border: '2px solid #e2e8f0', borderRadius: '12px' }} onClick={() => setMoving(true)} disabled={moving}>
            <span className="material-icons-round" style={{ fontSize: 24 }}>swap_horiz</span>
            نقل الطاولة
          </button>

          <button className="btn btn-primary flex-1 kitchen-btn" style={{ borderRadius: '12px', fontSize: '1.1rem' }} onClick={() => window.print()}>
            <span className="material-icons-round" style={{ fontSize: 24 }}>print</span>
            طباعة الفاتورة
          </button>
        </div>
      </div>

      <style>{`
        /* Custom Modern Scrollbar */
        .modal-body::-webkit-scrollbar { width: 5px; }
        .modal-body::-webkit-scrollbar-track { background: #f8fafc; }
        .modal-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .modal-body::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .order-item-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px; background: #fff; border: 1px solid #f1f5f9;
          cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border-right: 5px solid #e2e8f0;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .order-item-row:hover { 
          transform: translateX(-5px); 
          box-shadow: 0 12px 20px -10px rgba(0,0,0,0.1); 
          border-right-color: var(--color-primary);
        }
        .order-item-row.is-done { 
          background: #f8fafc; 
          border-color: #f1f5f9; 
          border-right-color: #10b981; 
          opacity: 0.8;
        }
        .order-item-row.is-done .item-name { text-decoration: line-through; color: #94a3b8; }
        .order-item-row.is-loading { opacity: 0.5; pointer-events: none; }
        
        .qty-badge {
          width: 38px; height: 38px; background: #f1f5f9; 
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; color: #1e293b; font-size: 16px;
          border-radius: 0;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }
        .is-done .qty-badge { background: #10b981; color: #fff; box-shadow: none; }
        
        .item-name { font-weight: 900; font-size: 17px; color: #0f172a; }
        .item-price-sub { font-size: 11px; font-weight: 800; color: #64748b; margin-top: 2px; }
        .item-total-price { font-weight: 900; color: #1e293b; font-size: 18px; }
        
        .total-box-kitchen {
          margin-top: 30px; padding: 25px; 
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.05);
        }

        .kitchen-btn { height: 56px; font-weight: 900; border-radius: 0; text-transform: uppercase; letter-spacing: 1px; }
        .status-toggle { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
      `}</style>
    </div>
  );
}

function PaymentModal({ payment, onApprove, onReject, onClose, approving, rejecting }) {
  if (!payment) return null;

  return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', zIndex: 1000 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500, width: '100%', borderRadius: 0, overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.4)', background: '#fff' }}>

        {/* Header */}
        <div className="modal-header" style={{ padding: '24px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex items-center gap-4">
            <div style={{ width: 44, height: 44, background: 'var(--color-primary-light)', borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons-round text-primary" style={{ fontSize: 24 }}>receipt_long</span>
            </div>
            <div>
              <h3 className="font-black text-xl leading-none">مراجعة الدفع</h3>
              <div className="text-xs text-secondary mt-1 uppercase tracking-wider font-bold">طلب رقم #{payment.order_id}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={approving || rejecting} style={{ borderRadius: 0 }}><span className="material-icons-round">close</span></button>
        </div>

        {/* Receipt Image Container */}
        <div style={{ background: '#0f172a', height: 420, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: '30px' }}>
          <img
            src={`${API_BASE_URL}/storage/${payment.receipt_image_path}`}
            alt="Receipt"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: 0, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
          />
        </div>

        {/* Footer Actions */}
        <div className="p-8" style={{ background: '#fff' }}>
          <div className="flex justify-between items-center mb-8 p-6" style={{ background: 'var(--color-bg-alt)', borderRadius: 0, border: '1px solid var(--color-border)' }}>
            <div className="text-sm font-bold text-secondary uppercase tracking-wide">المبلغ المطلوب تأكيده:</div>
            <div className="text-4xl font-black text-primary">₪{parseFloat(payment.amount_to_pay || 0).toFixed(2)}</div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              type="button"
              className="btn btn-success"
              style={{ flex: 2, height: 64, fontSize: '1.2rem', fontWeight: 900, borderRadius: 0, boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)' }}
              onClick={(e) => { e.preventDefault(); onApprove(); }}
              disabled={approving || rejecting}
            >
              {approving ? <div className="spinner" style={{ width: 24, height: 24, borderTopColor: '#fff' }}></div> : 'تأكيد واستلام'}
            </button>

            <button
              type="button"
              className="btn"
              style={{ flex: 1, height: 64, fontSize: '1.2rem', color: '#ef4444', border: '2px solid #fee2e2', background: '#fff', borderRadius: 0, fontWeight: 'bold' }}
              onClick={(e) => { e.preventDefault(); onReject(); }}
              disabled={approving || rejecting}
            >
              {rejecting ? <div className="spinner" style={{ width: 22, height: 22, borderTopColor: '#ef4444' }}></div> : 'رفض'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState('tables');
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [tables, setTables] = useState([]);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const navigate = useNavigate();
  const errorCountRef = useRef(0);

  // Generate a beep sound locally - no internet needed
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) { /* silent fail */ }
  };

  const fetchTables = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/tables');
      const newTables = res.data.tables;
      errorCountRef.current = 0; // reset error count on success

      const hasNewPending = newTables.some(t => t.status === 'pending_payment' && !tables.find(old => old.id === t.id && old.status === 'pending_payment'));
      
      const currentTotalQty = tables.reduce((acc, t) => acc + (t.current_session?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0), 0);
      const newTotalQty = newTables.reduce((acc, t) => acc + (t.current_session?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0), 0);
      
      if (hasNewPending || newTotalQty > currentTotalQty) {
        playBeep();
      }

      setTables(newTables);
    } catch (err) {
      errorCountRef.current += 1;
      // Only redirect to login on actual 401, not on network/timeout errors
      if (err.response?.status === 401) {
        navigate('/admin/login');
      }
      // Ignore network errors silently - will retry next interval
    }
    setLoading(false);
  }, [tables, navigate]);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 10000); // 10s for better stability
    return () => clearInterval(interval);
  }, [fetchTables]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_role');
    navigate('/admin/login');
  };

  const addTable = async () => {
    try {
      setLoading(true);
      await api.post('/dashboard/tables');
      setTimeout(fetchTables, 500);
    } catch (e) {
      alert('خطأ في إضافة طاولة');
      setLoading(false);
    }
  };

  const approvePayment = async (id) => {
    if (approving || rejecting) return;
    setApproving(true);
    try {
      await api.post(`/dashboard/payments/${id}/approve`);
      await fetchTables();
      setSelectedPayment(null);
    } catch (e) {
      alert(e.response?.data?.message || 'فشل تأكيد الدفع');
    } finally {
      setApproving(false);
    }
  };

  const rejectPayment = async (id) => {
    if (approving || rejecting) return;
    setRejecting(true);
    try {
      await api.post(`/dashboard/payments/${id}/reject`);
      await fetchTables();
      setSelectedPayment(null);
    } catch (e) {
      alert(e.response?.data?.message || 'فشل رفض الدفع');
    } finally {
      setRejecting(false);
    }
  };

  const releaseTable = async (id) => {
    try {
      await api.post(`/dashboard/tables/${id}/release`);
      fetchTables();
      setSelectedTable(null);
    } catch (e) {
      alert('فشل إغلاق الطاولة');
    }
  };

  const moveTable = async (sourceId, targetId) => {
    try {
      await api.post(`/dashboard/tables/${sourceId}/move`, { target_table_id: targetId });
      fetchTables();
      setSelectedTable(null);
    } catch (e) {
      alert(e.response?.data?.message || 'فشل نقل الطاولة');
    }
  };

  const toggleItemPrepared = async (itemId) => {
    try {
      await api.post(`/dashboard/items/${itemId}/toggle-prepared`);
      fetchTables();
    } catch (e) {
      alert('فشل تحديث حالة الصنف');
    }
  };

  const pendingCount = tables.filter(t => t.status === 'pending_payment').length;

  if (loading) return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p className="mt-4 font-bold text-secondary">جاري تحميل لوحة التحكم...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-alt)' }}>
      {/* Header */}
      <div className="navbar">
        <div className="container navbar-inner">
          <div className="navbar-brand"><span>لوحة تحكم الكافيه</span></div>
          <div className="flex items-center gap-4">
            {installPrompt && (
              <button className="btn btn-primary btn-sm" onClick={handleInstall}>
                <span className="material-icons-round">download</span>
                تثبيت التطبيق
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              <span className="material-icons-round">logout</span>
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="tabs-bar">
        <div className="container tabs-inner">
          <button className={`tab-item ${tab === 'tables' ? 'active' : ''}`} onClick={() => setTab('tables')}>
            <span className="material-icons-round">grid_view</span>
            خريطة الطاولات
          </button>
          <button className={`tab-item ${tab === 'menu' ? 'active' : ''}`} onClick={() => setTab('menu')}>
            <span className="material-icons-round">restaurant_menu</span>
            إدارة المنيو
          </button>
        </div>
      </div>

      <div className="container page">
        {tab === 'tables' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                {Object.entries(STATUS_LABEL).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div style={{ background: STATUS_COLOR[key], width: 12, height: 12 }}></div>
                    <span className="text-sm font-bold">{label}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" onClick={addTable}>
                <span className="material-icons-round">add</span>
                إضافة طاولة جديدة
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center p-12"><div className="spinner" style={{ width: 40, height: 40 }}></div></div>
            ) : (
              <div className="admin-grid">
                {tables.map(table => {
                  const isPending = table.status === 'pending_payment';
                  const hasUnprepared = table.current_session?.items?.some(item => !item.is_prepared);

                  return (
                    <div key={table.id} className={`table-card ${hasUnprepared ? 'has-new-order' : ''}`} onClick={() => {
                      if (isPending) {
                        const p = { ...table.current_session.payment, amount_to_pay: table.current_session.total_price };
                        setSelectedPayment(p);
                      } else {
                        setSelectedTable(table);
                      }
                    }}>
                      <div className="table-status-dot" style={{ background: STATUS_COLOR[table.status] }}></div>
                      <div className="table-number">{table.table_number}</div>
                      <div className="table-status-label" style={{ color: STATUS_COLOR[table.status] }}>{STATUS_LABEL[table.status]}</div>
                      
                      {isPending && (
                        <div className="badge-review">مراجعة الدفع</div>
                      )}

                      {hasUnprepared && !isPending && (
                        <div className="badge-new-order">
                          <span className="material-icons-round" style={{ fontSize: 14 }}>notifications_active</span>
                          طلب جديد
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'menu' && <MenuManagement />}
      </div>

      {selectedTable && (
        <TableDetailsModal 
          table={selectedTable} 
          onClose={() => setSelectedTable(null)} 
          onToggleItem={toggleItemPrepared}
          onRelease={releaseTable}
          onMove={moveTable}
          allTables={tables}
        />
      )}
      {selectedPayment && (
        <PaymentModal
          payment={selectedPayment}
          approving={approving}
          rejecting={rejecting}
          onApprove={() => approvePayment(selectedPayment.id)}
          onReject={() => rejectPayment(selectedPayment.id)}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}
