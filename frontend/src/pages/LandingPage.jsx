import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* Navbar */}
      <nav className="navbar" style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: 'none', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)' }}>
        <div className="container navbar-inner" style={{ alignItems: 'center' }}>
          <div className="navbar-brand" style={{ gap: '12px' }}>
            <span className="material-icons-round" style={{ background: 'var(--color-primary)', color: '#fff', padding: '8px', borderRadius: '12px', fontSize: '24px', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)' }}>coffee</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px' }}>كافيه ريف</span>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/login')} style={{ borderRadius: '50px', padding: '8px 24px', fontWeight: 800, border: '2px solid var(--color-primary)', color: 'var(--color-primary)' }}>
            دخول الإدارة
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" style={{ padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="hero-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="badge-pill animate-fade-in-up" style={{ margin: '0 auto 24px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '8px 16px', borderRadius: '50px', width: 'auto', display: 'inline-flex', fontSize: '0.9rem', gap: '8px' }}>
              <span className="material-icons-round" style={{ fontSize: '18px' }}>celebration</span>
              نظام إدارة المقاهي الذكي
            </div>
            
            <h1 className="hero-title animate-fade-in-up" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, lineHeight: 1.2, marginBottom: '24px', color: 'var(--color-text)', letterSpacing: '-1px', animationDelay: '0.1s' }}>
              مستقبل الضيافة يبدأ <span style={{ color: 'var(--color-primary)', position: 'relative' }}>من هنا<svg style={{ position: 'absolute', bottom: '-10px', left: 0, width: '100%', height: '12px' }} viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 15 100 5" stroke="var(--color-warning)" strokeWidth="4" fill="transparent"/></svg></span>
            </h1>
            
            <p className="hero-subtitle animate-fade-in-up" style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', marginBottom: '40px', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto 40px', animationDelay: '0.2s' }}>
              تجربة فريدة للزبائن وسهولة مطلقة في الإدارة. امسح رمز الطاولة، اطلب قهوتك، وادفع بكل سهولة دون انتظار.
            </p>

            <div className="hero-actions animate-fade-in-up" style={{ display: 'flex', gap: '16px', justifyContent: 'center', animationDelay: '0.3s' }}>
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.8)' }}>
                <span className="material-icons-round text-primary" style={{ fontSize: '48px', animation: 'float 3s ease-in-out infinite' }}>qr_code_scanner</span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900 }}>أنت زبون؟</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>قم بمسح الـ QR الموجود على طاولتك لتبدأ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0', background: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px' }}>لماذا كافيه ريف؟</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>نظام متكامل صُمم خصيصاً لراحتك</p>
          </div>

          <div className="grid cols-3 gap-4 feature-grid">
            
            <div className="feature-card glass-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <span className="material-icons-round">restaurant_menu</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '16px 0 8px' }}>منيو رقمي ذكي</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>استعرض القائمة بالصور، أضف طلباتك للسلة، وأرسلها للمطبخ بضغطة زر.</p>
            </div>

            <div className="feature-card glass-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
                <span className="material-icons-round">payments</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '16px 0 8px' }}>دفع إلكتروني آمن</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>ارفع وصل الدفع البنكي مباشرة من هاتفك وسيتم تأكيده فوراً من الإدارة.</p>
            </div>

            <div className="feature-card glass-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="feature-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
                <span className="material-icons-round">speed</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '16px 0 8px' }}>متابعة حية</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>تابع حالة طلبك أولاً بأول من لحظة الإرسال وحتى التقديم على طاولتك.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: 'white', padding: '60px 0 40px', borderTop: '4px solid var(--color-primary)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span className="material-icons-round" style={{ color: 'var(--color-primary)', fontSize: '32px' }}>coffee</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>كافيه ريف</span>
          </div>
          <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            النظام الأحدث والأذكى لإدارة المقاهي وتجربة الزبائن.
          </p>
          <div style={{ padding: '24px 0 0', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#64748b', fontSize: '0.9rem' }}>
            © {new Date().getFullYear()} كافيه ريف. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
}
