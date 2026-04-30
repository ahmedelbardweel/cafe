import { useNavigate } from 'react-router-dom';

const fadeIn = (delay = 0) => ({
  animation: `fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
});

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>

      {/* Navbar */}
      <nav className="navbar" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div className="container navbar-inner">
          <div className="navbar-brand" style={{ gap: 10 }}>
            <span className="material-icons-round" style={{ background: 'var(--color-primary)', color: '#fff', padding: 8, borderRadius: 12, fontSize: 22 }}>coffee</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 900 }}>كافيه ريف</span>
          </div>
          <button
            onClick={() => navigate('/admin/login')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 50, fontWeight: 800, fontSize: '0.9rem', border: '2px solid var(--color-primary)', color: 'var(--color-primary)', background: 'transparent', cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}
          >
            <span className="material-icons-round" style={{ fontSize: 18 }}>manage_accounts</span>
            دخول الإدارة
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #f0fdf4 100%)', padding: '100px 0 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'rgba(59,130,246,0.12)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 350, height: 350, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', filter: 'blur(80px)' }} />

        <div className="container" style={{ position: 'relative', zIndex: 5, textAlign: 'center' }}>

          {/* Badge */}
          <div style={{ ...fadeIn(0), display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '8px 20px', borderRadius: 50, fontSize: '0.85rem', fontWeight: 800, marginBottom: 32 }}>
            <span className="material-icons-round" style={{ fontSize: 18 }}>auto_awesome</span>
            نظام إدارة المقاهي الذكي
          </div>

          {/* Title */}
          <h1 style={{ ...fadeIn(0.1), fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.2, color: '#0f172a', marginBottom: 20 }}>
            مستقبل الضيافة يبدأ{' '}
            <span style={{ color: 'var(--color-primary)' }}>من هنا ☕</span>
          </h1>

          {/* Subtitle */}
          <p style={{ ...fadeIn(0.2), fontSize: '1.1rem', color: '#64748b', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.9 }}>
            تجربة فريدة للزبائن وسهولة مطلقة في الإدارة. امسح رمز الطاولة، اطلب قهوتك، وادفع بكل سهولة دون انتظار.
          </p>

          {/* QR Card */}
          <div style={{ ...fadeIn(0.3), display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 24, padding: '32px 48px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
            <span className="material-icons-round" style={{ fontSize: 64, color: 'var(--color-primary)', animation: 'float 3s ease-in-out infinite' }}>qr_code_scanner</span>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>أنت زبون؟</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>امسح الـ QR على طاولتك لتبدأ الطلب فوراً</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0', background: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>لماذا كافيه ريف؟</h2>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>نظام متكامل صُمم خصيصاً لراحتك</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>

            {[
              { icon: 'restaurant_menu', color: 'var(--color-primary)', bg: 'var(--color-primary-light)', title: 'منيو رقمي ذكي', desc: 'استعرض القائمة بالصور، أضف طلباتك للسلة، وأرسلها للمطبخ بضغطة زر.' },
              { icon: 'payments', color: 'var(--color-success)', bg: 'rgba(16,185,129,0.1)', title: 'دفع إلكتروني آمن', desc: 'ارفع وصل الدفع البنكي مباشرة من هاتفك وسيتم تأكيده فوراً من الإدارة.' },
              { icon: 'speed', color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.1)', title: 'متابعة حية', desc: 'تابع حالة طلبك أولاً بأول من لحظة الإرسال وحتى التقديم على طاولتك.' },
            ].map((f, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', transition: 'all 0.3s ease', ...fadeIn(0.1 * (i + 1)) }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'; }}
              >
                <div style={{ width: 60, height: 60, background: f.bg, color: f.color, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <span className="material-icons-round" style={{ fontSize: 30 }}>{f.icon}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: '0.95rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: 'white', padding: '60px 0 40px', borderTop: '4px solid var(--color-primary)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span className="material-icons-round" style={{ color: 'var(--color-primary)', fontSize: 32 }}>coffee</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>كافيه ريف</span>
          </div>
          <p style={{ color: '#94a3b8', maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.7 }}>
            النظام الأحدث والأذكى لإدارة المقاهي وتجربة الزبائن.
          </p>
          <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', color: '#64748b', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} كافيه ريف. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
}
