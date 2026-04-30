import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api, { API_BASE_URL } from '../api';

// عنصر السلة
function CartItem({ item, onIncrease, onDecrease }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border-light)' }}>
      <div className="flex-1">
        <div className="font-medium">{item.name}</div>
        <div className="text-sm text-secondary">{item.quantity} × ₪{item.price}</div>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn btn-ghost btn-sm" style={{ width: 30, height: 30, padding: 0 }} onClick={() => onDecrease(item.id)}><span className="material-icons-round" style={{ fontSize: 18 }}>remove</span></button>
        <span className="font-bold" style={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
        <button className="btn btn-primary btn-sm" style={{ width: 30, height: 30, padding: 0 }} onClick={() => onIncrease(item.id)}><span className="material-icons-round" style={{ fontSize: 18 }}>add</span></button>
      </div>
      <div className="font-bold text-primary" style={{ marginRight: 12, minWidth: 50, textAlign: 'left' }}>
        ₪{(item.price * item.quantity).toFixed(2)}
      </div>
    </div>
  );
}

export default function CustomerView() {
  const { uuid } = useParams();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [billOpen, setBillOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [paid, setPaid] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [table, setTable] = useState(null);
  const [tableStatus, setTableStatus] = useState('available');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showIOSInvite, setShowIOSInvite] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isIOS && !isStandalone) {
      setShowIOSInvite(true);
    }

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
  const fileRef = useRef();
  const pollingRef = useRef();

  useEffect(() => {
    loadMenu();
    startSession();
    return () => clearInterval(pollingRef.current);
  }, [uuid]);

  const loadMenu = async () => {
    try {
      const res = await api.get('/menu');
      setCategories(res.data.categories);
    } catch (e) { }
    setLoading(false);
  };

  const startSession = async () => {
    try {
      const res = await api.get(`/tables/${uuid}`);
      setTable(res.data.table);
      setTableStatus(res.data.table.status);
      if (res.data.current_session) {
        setActiveOrder(res.data.current_session);
        setSessionStarted(true);
        pollStatus();
      }
    } catch (e) {
      if (e.response?.status === 403) setLocked(true);
    }
  };

  const createSessionIfNeeded = async () => {
    if (sessionStarted || tableStatus === 'busy' || tableStatus === 'pending_payment') return true;
    try {
      const res = await api.post(`/tables/${uuid}/session`);
      setSessionStarted(true);
      setActiveOrder(res.data.session);
      setTableStatus('busy');
      pollStatus();
      return true;
    } catch (e) {
      alert('عذراً، الطاولة غير متاحة حالياً.');
      return false;
    }
  };

  const pollStatus = () => {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/tables/${uuid}`);
        const status = res.data.table.status;
        setTable(res.data.table);
        setTableStatus(status);
        if (res.data.current_session) {
          setActiveOrder(res.data.current_session);
        }
        if (status === 'available') {
          setLocked(false);
          setPaid(true);
          setActiveOrder(null);
          clearInterval(pollingRef.current);
          setTimeout(() => setPaid(false), 10000);
        }
      } catch (e) { }
    }, 7000);
  };

  const addToCart = async (item) => {
    const ok = await createSessionIfNeeded();
    if (!ok) return;

    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const increase = (id) => setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: c.quantity + 1 } : c));
  const decrease = (id) => setCart(prev => {
    const item = prev.find(c => c.id === id);
    if (item.quantity === 1) return prev.filter(c => c.id !== id);
    return prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c);
  });

  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const totalPrice = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  const activeItems = activeCategory === 'all'
    ? categories.flatMap(c => c.menu_items)
    : categories.find(c => c.id === activeCategory)?.menu_items || [];

  const handleSendOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      await api.post(`/tables/${uuid}/order`, {
        items: cart.map(c => ({ id: c.id, quantity: c.quantity }))
      });
      const res = await api.get(`/tables/${uuid}`);
      setActiveOrder(res.data.current_session);
      setCart([]);
      setCartOpen(false);
    } catch (e) {
      alert('عذراً، حدث خطأ أثناء إرسال الطلب. حاول مجدداً.');
    }
    setSubmitting(false);
  };

  const handleCheckout = async () => {
    if (!receiptFile) return;
    setSubmitting(true);
    const form = new FormData();
    form.append('receipt_image', receiptFile);
    try {
      await api.post(`/tables/${uuid}/checkout`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLocked(true);
      setCheckout(false);
      pollStatus();
    } catch (e) {
      alert('حدث خطأ أثناء رفع الوصل.');
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p className="mt-4 font-bold text-secondary">جاري تحميل المنيو...</p>
    </div>
  );

  if (paid) return (
    <div className="lock-screen" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 20, color: '#fff' }}>
      <div className="pulse-icon" style={{ width: 120, height: 120, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
        <span className="material-icons-round" style={{ fontSize: 70, color: '#fff' }}>check_circle</span>
      </div>
      
      <h2 className="text-4xl font-black mb-4" style={{ textAlign: 'center' }}>تم الدفع بنجاح!</h2>
      <p style={{ textAlign: 'center', opacity: 0.9, maxWidth: 350, lineHeight: 1.8, fontSize: '1.1rem', marginBottom: 40 }}>
        شكراً لزيارتكم لنا في كافيه "القهوة العربية". نتمنى أن تكونوا قد استمتعتم بتجربتكم معنا اليوم. ننتظركم دائماً!
      </p>

      <button 
        className="btn" 
        onClick={() => setPaid(false)} 
        style={{ 
          background: '#fff', 
          color: '#059669', 
          padding: '16px 40px', 
          fontSize: '1.1rem', 
          fontWeight: '900',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}
      >
        <span className="material-icons-round">restaurant_menu</span>
        العودة للمنيو الرئيسي
      </button>

      <div style={{ position: 'absolute', bottom: 30, opacity: 0.6, fontSize: '0.8rem' }}>
        رقم المعاملة: #{Math.floor(Math.random() * 1000000)}
      </div>
    </div>
  );

  if (locked) return (
    <div className="lock-screen" style={{ background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <div style={{ background: '#fff', padding: '40px 30px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', textAlign: 'center', width: '100%', maxWidth: 400 }}>
        <div className="pulse-icon mb-6" style={{ width: 80, height: 80, background: 'var(--color-primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          <span className="material-icons-round" style={{ fontSize: 40, color: 'var(--color-primary)' }}>lock</span>
        </div>
        <h2 className="text-2xl font-black mb-3" style={{ color: 'var(--color-text)' }}>الطاولة مغلقة مؤقتاً</h2>
        <p className="text-secondary mb-8" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
          لقد تم إرسال طلب الدفع الخاص بك بنجاح. يرجى الانتظار قليلاً حتى يقوم الموظف بتأكيد العملية وفتح الطاولة مجدداً.
        </p>
        
        <div className="flex items-center justify-center gap-3 py-3 px-4" style={{ background: 'var(--color-bg-alt)', display: 'inline-flex' }}>
          <div className="spinner" style={{ width: 18, height: 18, borderTopColor: 'var(--color-primary)' }}></div>
          <span className="text-sm font-bold text-primary">بانتظار تأكيد الإدارة...</span>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-secondary opacity-60">كافيه القهوة العربية - نظام إدارة الطاولات الذكي</p>
    </div>
  );

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div className="navbar">
        <div className="container navbar-inner">
          <div className="navbar-brand"> <span>منيو الكافيه</span></div>
          <div className="flex items-center gap-2">
            {installPrompt && (
              <button className="btn btn-sm btn-primary" onClick={handleInstall} style={{ fontSize: '12px', padding: '4px 12px' }}>
                <span className="material-icons-round" style={{ fontSize: '16px' }}>download</span>
                تثبيت التطبيق
              </button>
            )}
            <div className="badge badge-available">طاولة #{table ? table.table_number : uuid?.slice(0, 4).toUpperCase()}</div>
          </div>
        </div>
      </div>

      {showIOSInvite && (
        <div className="container mt-4">
          <div className="card-glass p-4" style={{ border: '1px solid var(--color-primary)', background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <div className="flex items-start gap-3">
              <span className="material-icons-round">ios_share</span>
              <div style={{ flex: 1 }}>
                <div className="font-black text-sm">تثبيت على الآيفون</div>
                <div className="text-xs opacity-90 mt-1">اضغط على زر <strong>المشاركة</strong> في المتصفح ثم اختر <strong>"إضافة إلى الشاشة الرئيسية"</strong> لتثبيت التطبيق.</div>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowIOSInvite(false)} style={{ minWidth: 0, padding: 4 }}><span className="material-icons-round" style={{ fontSize: 18 }}>close</span></button>
            </div>
          </div>
        </div>
      )}
      <div className="container page">
        {/* The Menu Content stays the same, just removing the Bill Card from top */}
        <div className="category-tabs mb-4" style={{ padding: '4px 0' }}>
          <button className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
            الكل
          </button>
          {categories.map(cat => (
            <button key={cat.id} className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => setActiveCategory(cat.id)}>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid cols-3 gap-4">
          {activeItems.map(item => (
            <div key={item.id} className="menu-item-card" onClick={() => addToCart(item)}>
              <div className="menu-item-img">
                {item.image ? (
                  <img src={`${API_BASE_URL}/storage/${item.image}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.name} />
                ) : (
                  <div className="flex items-center justify-center h-full" style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-icons-round" style={{ fontSize: 32, color: '#e2e8f0' }}>restaurant</span>
                  </div>
                )}
              </div>
              <div className="menu-item-body">
                <div className="font-bold" style={{ fontSize: '0.9rem', marginBottom: 2 }}>{item.name}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="menu-item-price" style={{ fontSize: '0.95rem' }}>₪{parseFloat(item.price).toFixed(2)}</div>
                  <div className="btn btn-primary btn-sm" style={{ padding: '2px 6px', minWidth: 28 }}>
                    <span className="material-icons-round" style={{ fontSize: 16 }}>add</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Buttons Capsule */}
      {(totalItems > 0 || (activeOrder && activeOrder.items?.length > 0)) && !cartOpen && !billOpen && (
        <div className="floating-actions">
          {/* New Cart Button */}
          {totalItems > 0 && (
            <div className="floating-btn-capsule btn-cart" onClick={() => setCartOpen(true)}>
              <div className="flex items-center gap-2">
                <div className="badge-pill" style={{ color: 'var(--color-primary)' }}>{totalItems}</div>
                <span className="font-bold">السلة</span>
              </div>
              <span className="font-black">₪{totalPrice.toFixed(2)}</span>
            </div>
          )}

          {/* Existing Bill Button */}
          {activeOrder && activeOrder.items?.length > 0 && (
            <div className="floating-btn-capsule btn-bill" onClick={() => setBillOpen(true)}>
              <div className="flex items-center gap-2">
                <span className="material-icons-round">receipt</span>
                <span className="font-bold">الحساب</span>
              </div>
              <span className="font-black">₪{parseFloat(activeOrder.total_price).toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Cart Bottom Sheet */}
      {cartOpen && (
        <div className="bottom-sheet-overlay" onClick={() => setCartOpen(false)}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-header">
              <h3 className="text-lg font-bold">سلة الطلبات الجديدة</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setCartOpen(false)}><span className="material-icons-round">close</span></button>
            </div>
            <div className="sheet-body">
              {cart.map(item => (
                <div key={item.id} className="cart-item-row">
                  <div style={{ flex: 1 }}>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-sm text-primary font-bold mt-1">₪{item.price}</div>
                  </div>
                  <div className="qty-pill">
                    <div className="qty-action" onClick={() => decrease(item.id)}>-</div>
                    <div className="font-bold" style={{ width: 20, textAlign: 'center' }}>{item.quantity}</div>
                    <div className="qty-action" onClick={() => increase(item.id)}>+</div>
                  </div>
                </div>
              ))}
              <div className="mt-6 p-4" style={{ background: 'var(--color-bg-alt)' }}>
                <div className="flex justify-between font-black text-lg mb-4">
                  <span>المجموع</span>
                  <span className="text-primary">₪{totalPrice.toFixed(2)}</span>
                </div>
                <button className="btn btn-primary btn-full" style={{ height: 52 }} onClick={handleSendOrder} disabled={submitting}>
                  {submitting ? <div className="spinner" style={{ width: 20, height: 20, borderTopColor: '#fff' }}></div> : '🛎 إرسال للمطبخ الآن'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bill Bottom Sheet */}
      {billOpen && (
        <div className="bottom-sheet-overlay" onClick={() => setBillOpen(false)}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-header">
              <h3 className="text-lg font-bold">كشف حساب الطاولة</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setBillOpen(false)}><span className="material-icons-round">close</span></button>
            </div>
            <div className="sheet-body">
              <div className="mb-4 text-xs text-secondary">الأصناف التي تم طلبها مسبقاً</div>
              {activeOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <span className="text-sm">{item.quantity}x {item.menu_item?.name}</span>
                  <span className="font-bold text-sm">₪{(item.quantity * item.menu_item?.price).toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-8 p-0" style={{ background: 'var(--color-bg-alt)', border: 'none' }}>
                <div className="p-5">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <div className="text-xs text-secondary mb-1">المبلغ الإجمالي المطلوب</div>
                      <div className="text-3xl font-black text-primary" style={{ lineHeight: 1 }}>₪{parseFloat(activeOrder.total_price).toFixed(2)}</div>
                    </div>
                    <div className="badge badge-primary" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '6px 12px' }}>قيد التحضير</div>
                  </div>
                  
                  {tableStatus !== 'pending_payment' && (
                    <button className="btn btn-success btn-full" style={{ height: 56, fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }} onClick={() => { setBillOpen(false); setCheckout(true); }}>
                      <span className="material-icons-round" style={{ fontSize: 24 }}>payments</span>
                      طلب الفاتورة وإغلاق الحساب
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkout && (
        <div className="modal-overlay" onClick={() => setCheckout(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-bold text-lg">إتمام عملية الدفع</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setCheckout(false)}><span className="material-icons-round">close</span></button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'var(--color-primary-light)', padding: 20, marginBottom: 20, border: '1px solid var(--color-primary)' }}>
                <div className="text-sm text-secondary mb-1">المبلغ الإجمالي المستحق</div>
                <div className="text-3xl font-black text-primary">₪{parseFloat(activeOrder?.total_price || totalPrice).toFixed(2)}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 16, marginBottom: 20, borderRight: '4px solid var(--color-primary)' }}>
                <div className="text-sm font-bold mb-2">🏦 بنك فلسطين (Bank of Palestine)</div>
                <div className="text-secondary text-sm">رقم الحساب: <strong>1234-5678-9012</strong></div>
                <div className="text-secondary text-sm">IBAN: <strong>PS92PALS000000001234567890</strong></div>
              </div>
              <div className="form-group">
                <label className="form-label">📎 ارفع صورة وصل الدفع</label>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={e => setReceiptFile(e.target.files[0])} style={{ display: 'none' }} />
                <button className="btn btn-ghost btn-full" onClick={() => fileRef.current.click()} style={{ border: '2px dashed var(--color-border)', height: 80 }}>
                  {receiptFile ? (
                    <div className="flex items-center gap-2 text-success font-bold">
                      <span className="material-icons-round">check_circle</span>
                      تم اختيار الوصل
                    </div>
                  ) : (
                    <div className="flex flex-direction-column items-center gap-1">
                      <span className="material-icons-round" style={{ fontSize: 32 }}>photo_camera</span>
                      <span>اضغط هنا لتصوير الوصل أو اختياره</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setCheckout(false)}>إلغاء</button>
              <button className="btn btn-primary" onClick={handleCheckout} disabled={!receiptFile || submitting}>
                {submitting ? <div className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }}></div> : 'تأكيد وإرسال الدفع'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
