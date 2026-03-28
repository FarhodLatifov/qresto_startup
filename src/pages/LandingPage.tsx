import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { QrCode, ArrowRight, ChefHat, Smartphone, UtensilsCrossed, BellRing, Sparkles, CheckCircle2, ChevronDown, Menu as MenuIcon, X, Plus, Minus, ShoppingBag, BarChart3, Zap } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { useAuth } from '../lib/auth';

// --- CUSTOM COMPONENTS FOR SUPREME WOW EFFECT ---

// 1. Magnetic Button
const MagneticButton = ({ children, className, onClick, type = "button" }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      type={type}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={onClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

// 2. Scroll Reveal
const ScrollReveal = ({ children, delay = 0, className = "" }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: "easeOut", delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// 3. Particles Background
const Particles = () => {
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  useEffect(() => {
    setDimensions({ w: window.innerWidth, h: window.innerHeight });
    const handleResize = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (dimensions.w === 0) return null;

  const particles = Array.from({ length: 40 });
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gold/40 shadow-[0_0_10px_rgba(212,175,55,0.8)]"
          initial={{
            x: Math.random() * dimensions.w,
            y: dimensions.h + 100,
            scale: Math.random() * 0.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.1
          }}
          animate={{
            y: -100,
            opacity: [0, Math.random() * 0.5 + 0.3, 0],
            x: `+=${Math.random() * 100 - 50}`
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 20
          }}
          style={{ width: Math.random() * 3 + 1, height: Math.random() * 3 + 1 }}
        />
      ))}
    </div>
  );
};

// --- MAIN PAGE ---

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const { user, loading } = useAuth();
  
  const [demoSlug, setDemoSlug] = useState('demo-rest');
  const [demoTable, setDemoTable] = useState('1');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

  const [tables, setTables] = useState(20);
  const [avgCheck, setAvgCheck] = useState(150);
  const hoursSaved = Math.round(tables * 2.5);
  const extraRevenue = Math.round(tables * avgCheck * 0.15 * 30);

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const faqs = [
    { q: t('faq_q1'), a: t('faq_a1') },
    { q: t('faq_q2'), a: t('faq_a2') },
    { q: t('faq_q3'), a: t('faq_a3') },
  ];

  // Real iframe mockup used instead of static state

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoSlug && demoTable) {
      navigate(`/menu/${demoSlug}/${demoTable}`);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('ru-RU').format(val);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-gold/30 selection:text-gold relative">
      <Particles />

      {/* Dynamic Background Blurs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold/5 rounded-full blur-[150px]" 
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px]" 
        />
      </div>

      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.2)] group hover:scale-105 transition-transform">
              <ChefHat className="w-6 h-6 text-gold group-hover:rotate-12 transition-transform" />
            </div>
            <span className="font-serif text-2xl font-medium tracking-tight text-white drop-shadow-md">QResto</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              {t('nav_features')}
            </button>
            <button onClick={() => scrollToSection('calculator')} className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Выгода
            </button>
            <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              {t('nav_pricing')}
            </button>
            <button onClick={() => scrollToSection('faq')} className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              FAQ
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              {(['ru', 'en'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${lang === l ? 'bg-gold text-dark' : 'text-white/60 hover:text-white'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            {user && !loading ? (
              <MagneticButton onClick={() => navigate('/admin')} className="text-sm font-medium bg-gold text-dark hover:bg-gold/90 transition-colors px-5 py-2 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                Дашборд
              </MagneticButton>
            ) : (
              <MagneticButton onClick={() => navigate('/login')} className="text-sm font-medium bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-colors px-5 py-2 rounded-xl">
                {t('nav_login')}
              </MagneticButton>
            )}
          </div>

          <button className="md:hidden text-white/80" onClick={() => setMobileMenuOpen(true)}>
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 space-y-8"
          >
            <button className="absolute top-6 right-6 text-white/60 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-8 h-8" />
            </button>
            <button onClick={() => scrollToSection('features')} className="text-2xl font-serif text-white hover:text-gold transition-colors">{t('nav_features')}</button>
            <button onClick={() => scrollToSection('calculator')} className="text-2xl font-serif text-white hover:text-gold transition-colors">Выгода</button>
            <button onClick={() => scrollToSection('pricing')} className="text-2xl font-serif text-white hover:text-gold transition-colors">{t('nav_pricing')}</button>
            <button onClick={() => scrollToSection('faq')} className="text-2xl font-serif text-white hover:text-gold transition-colors">FAQ</button>
            {user && !loading ? (
              <button onClick={() => navigate('/admin')} className="text-2xl font-serif text-white hover:text-gold transition-colors">Дашборд</button>
            ) : (
              <button onClick={() => navigate('/login')} className="text-2xl font-serif text-white hover:text-gold transition-colors">{t('nav_login')}</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 pt-32 pb-20">
        
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 min-h-[80vh] flex flex-col lg:flex-row items-center justify-between gap-16 py-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:w-1/2 space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              #1 QR-меню в Таджикистане
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif leading-tight text-white drop-shadow-xl">
              Увеличьте прибыль ресторана на <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-300">15%</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-xl">
              Инновационное QR-меню с моментальными заказами. Избавьтесь от бумажных меню и очередей за счетом.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <MagneticButton onClick={() => scrollToSection('pricing')} className="px-8 py-4 bg-gold text-dark rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                {t('hero_cta_primary')} <ArrowRight className="w-5 h-5" />
              </MagneticButton>
              <MagneticButton onClick={() => scrollToSection('demo')} className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-medium text-lg flex items-center justify-center gap-2 backdrop-blur-sm">
                <QrCode className="w-5 h-5" /> {t('demo_open')}
              </MagneticButton>
            </div>
          </motion.div>

          {/* Interactive Mockup with 3D Tilt Effect */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="lg:w-1/2 relative flex justify-center perspective-[2000px]"
          >
            <motion.div 
              whileHover={{ rotateX: 5, rotateY: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative w-full max-w-[320px] z-20"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-gold/30 to-purple-500/10 rounded-[44px] blur-3xl opacity-50 block" />
              
              <div className="relative bg-[#0d0d0d] border-[6px] border-[#222] rounded-[48px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),_0_0_20px_rgba(212,175,55,0.2)] h-[650px] flex flex-col overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-6 z-20 flex justify-center items-start pt-2">
                  <div className="w-24 h-5 bg-[#0d0d0d] rounded-b-2xl relative border-x border-b border-[#222]">
                    <div className="absolute top-1/2 right-4 w-2 h-2 rounded-full bg-white/10 -translate-y-1/2"/>
                  </div>
                </div>
                
                <div className="flex-1 bg-[#121212] overflow-hidden relative border-[2px] border-black rounded-[42px] m-1 p-0 pointer-events-auto">
                  <div className="absolute top-0 left-0 w-[400px] h-[850px] origin-top-left" style={{ transform: 'scale(0.76)' }}>
                    <iframe 
                      src="/menu/demo-rest/1" 
                      className="w-full h-full border-0" 
                      style={{ scrollbarWidth: 'none' }}
                      title="Demo Guest Menu"
                    />
                  </div>
                </div>
              </div>

              {/* Floating decor elements next to mockup */}
              <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute -left-12 sm:-left-20 top-32 bg-dark/60 backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3 z-30 pointer-events-none">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5"/></div>
                <div><p className="text-[10px] sm:text-xs text-white/60">Мгновенный заказ</p><p className="text-xs sm:text-sm font-medium">Без ожидания</p></div>
              </motion.div>
              
              <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute -right-8 sm:-right-16 bottom-40 bg-dark/60 backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3 z-30 pointer-events-none">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold"><QrCode className="w-4 sm:w-5 h-4 sm:h-5"/></div>
                <div><p className="text-[10px] sm:text-xs text-white/60">Всего сканирований</p><p className="text-xs sm:text-sm font-medium">1,200+ сегодня</p></div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* 3. Infinite Marquee */}
        <section className="py-6 border-y border-white/5 bg-gradient-to-r from-black via-white/5 to-black overflow-hidden relative z-10">
          <motion.div 
            className="flex whitespace-nowrap"
            animate={{ x: [0, -1000] }}
            transition={{ ease: "linear", duration: 25, repeat: Infinity }}
          >
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-16 items-center px-8 text-white/50 text-sm font-medium tracking-widest uppercase">
                  <span className="inline-flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold"/> Без скачивания</span>
                  <span className="inline-flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold"/> Telegram уведомления</span>
                  <span className="inline-flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold"/> Быстрые заказы</span>
                  <span className="inline-flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold"/> Увеличение выручки</span>
              </div>
            ))}
          </motion.div>
        </section>

        <div className="max-w-7xl mx-auto px-6">
          {/* Bento Grid Features Section */}
          <section id="features" className="py-24 pt-32">
            <ScrollReveal delay={0}>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Автоматизируйте рутину</h2>
                <p className="text-white/50 text-lg max-w-2xl mx-auto">Дизайн "Bento Grid" демонстрирует мощь платформы QResto наглядно.</p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 max-w-5xl mx-auto auto-rows-[280px]">
              
              {/* Bento Card 1: QR Menu */}
              <ScrollReveal delay={0.1} className="md:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-[32px] p-8 relative overflow-hidden group hover:border-gold/30 transition-all">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/20 transition-colors" />
                <div className="relative z-10 flex flex-col h-full justify-between w-2/3">
                  <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-6 shadow-lg shadow-gold/5">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif text-white mb-2">Бесконтактное меню</h3>
                    <p className="text-white/60 text-sm leading-relaxed">Гость сканирует QR-код на столе и мгновенно получает доступ к меню с сочными фотографиями блюд. Никаких бумажек и ожидания.</p>
                  </div>
                </div>
                {/* Visual Decoration */}
                <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-48 h-48 bg-black/50 backdrop-blur-sm border border-white/10 rounded-3xl p-4 flex items-center justify-center transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-white/20" />
                    <motion.div animate={{ y: [-40, 40, -40] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-x-0 h-1 bg-gold/80 shadow-[0_0_10px_rgba(212,175,55,1)]" />
                  </div>
                </div>
              </ScrollReveal>

              {/* Bento Card 2: Notifications */}
              <ScrollReveal delay={0.2} className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-[32px] p-8 relative overflow-hidden group hover:border-white/20 transition-all flex flex-col items-center text-center justify-between">
                <motion.div whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 10, 0] }} className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mt-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                  <BellRing className="w-10 h-10" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-serif text-white mb-2">Telegram Бот</h3>
                  <p className="text-white/50 text-sm">Мгновенные оповещения для официантов прямо в их телефоне.</p>
                </div>
              </ScrollReveal>

              {/* Bento Card 3: Analytics */}
              <ScrollReveal delay={0.3} className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-[32px] p-8 relative overflow-hidden group hover:border-white/20 transition-all flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-white mb-2">Аналитика</h3>
                  <p className="text-white/50 text-sm leading-relaxed">Отслеживайте популярку блюд и статистику за каждый день прямо в дашборде.</p>
                </div>
              </ScrollReveal>

              {/* Bento Card 4: Speed Customization */}
              <ScrollReveal delay={0.4} className="md:col-span-2 bg-gradient-to-tr from-black via-white/[0.03] to-white/[0.05] border border-white/10 rounded-[32px] p-8 relative overflow-hidden group hover:border-gold/30 transition-all">
                <div className="absolute inset-y-0 right-0 w-1/2 flex items-center justify-end pr-8 opacity-20 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <Zap className="w-48 h-48 text-gold drop-shadow-[0_0_40px_rgba(212,175,55,1)]" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-center w-2/3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs font-medium w-fit mb-4">
                    <Sparkles className="w-3 h-3 text-gold" /> Мгновенный старт
                  </div>
                  <h3 className="text-3xl font-serif text-white mb-3">Запуск за 15 минут</h3>
                  <p className="text-white/60 text-sm leading-relaxed max-w-sm">Мы создали максимально простой интерфейс для поваров и менеджеров. Вы просто добавляете фото, цену и описание — готово.</p>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* ROI Calculator Section */}
          <section id="calculator" className="py-24 border-t border-white/5">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">{t('calc_title')}</h2>
                <p className="text-white/50 text-lg max-w-2xl mx-auto">Инвестиции в QResto окупаются за считанные дни за счет увеличения оборачиваемости столов.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="max-w-4xl mx-auto glass-panel p-8 md:p-12 rounded-[40px] border border-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                
                <div className="grid md:grid-cols-2 gap-12 relative z-10">
                  <div className="space-y-8">
                    <div>
                      <label className="flex justify-between text-sm text-white/60 mb-4">
                        <span>{t('calc_tables')}</span>
                        <span className="font-mono text-gold font-bold">{tables}</span>
                      </label>
                      <input 
                        type="range" 
                        min="5" max="100" 
                        value={tables} 
                        onChange={(e) => setTables(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
                      />
                    </div>

                    <div>
                      <label className="flex justify-between text-sm text-white/60 mb-4">
                        <span>{t('calc_check')}</span>
                        <span className="font-mono text-gold font-bold">{avgCheck} TJS</span>
                      </label>
                      <input 
                        type="range" 
                        min="50" max="1000" step="50"
                        value={avgCheck} 
                        onChange={(e) => setAvgCheck(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
                      />
                    </div>
                    
                    <p className="text-xs text-white/40 leading-relaxed italic border-l-2 border-gold/30 pl-4">
                      Расчеты примерные и основаны на статистике увеличения заказов на 15% за счет красочного меню и отсутствия ожидания официанта.
                    </p>
                  </div>

                  <div className="flex flex-col justify-center space-y-6 bg-black/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-inner">
                    <div>
                      <div className="text-white/50 text-sm mb-1 uppercase tracking-wider text-[10px] font-semibold">{t('calc_saved_time')}</div>
                      <div className="text-4xl font-serif text-white">{hoursSaved} <span className="text-xl text-white/40">ч.</span></div>
                    </div>
                    <div className="h-px w-full bg-white/10" />
                    <div>
                      <div className="text-white/50 text-sm mb-1 uppercase tracking-wider text-[10px] font-semibold">{t('calc_extra_revenue')}</div>
                      <div className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200 font-bold font-serif drop-shadow-sm">
                        {formatCurrency(extraRevenue)} <span className="text-xl text-gold/70">TJS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="py-24 border-t border-white/5">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">{t('pricing_title')}</h2>
                <p className="text-white/50 text-lg max-w-2xl mx-auto">Все функции доступны сразу, без скрытых платежей.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] flex flex-col hover:border-gold/30 transition-all duration-500">
                  <h3 className="text-2xl font-serif text-white mb-2">{t('pricing_basic')}</h3>
                  <div className="text-4xl font-light text-white mb-6">Бесплатно <span className="text-base text-white/40 font-sans">/ 14 дней</span></div>
                  <ul className="space-y-4 mb-10 flex-1 mt-4">
                    {[t('feature_qr'), t('feature_menu')].map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-white/70">
                        <CheckCircle2 className="w-5 h-5 text-green-400" /> {feat}
                      </li>
                    ))}
                  </ul>
                  <MagneticButton onClick={() => window.location.href='mailto:contact@qresto.tj'} className="w-full py-4 bg-white/5 border border-white/20 hover:bg-white/10 text-white rounded-2xl font-medium transition-colors">
                    Связаться с нами
                  </MagneticButton>
                </div>

                <div className="bg-gradient-to-b from-dark to-black border border-gold p-8 rounded-[40px] flex flex-col relative shadow-[0_0_50px_rgba(212,175,55,0.15)] transform md:-translate-y-4">
                  <div className="absolute top-0 right-8 -translate-y-1/2 bg-gold text-dark px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    {t('pricing_popular')}
                  </div>
                  <h3 className="text-2xl font-serif text-gold mb-2">{t('pricing_pro')}</h3>
                  <div className="text-4xl font-light text-white mb-6">500 TJS <span className="text-base font-sans text-white/40">/ месяц</span></div>
                  <ul className="space-y-4 mb-10 flex-1 mt-4">
                    {[t('feature_qr'), t('feature_menu'), t('feature_tg'), t('feature_stats')].map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-white/90">
                        <CheckCircle2 className="w-5 h-5 text-gold" /> {feat}
                      </li>
                    ))}
                  </ul>
                  <MagneticButton onClick={() => window.location.href='mailto:contact@qresto.tj'} className="w-full py-4 bg-gradient-to-r from-gold to-yellow-400 hover:from-yellow-400 hover:to-gold text-dark rounded-2xl font-semibold transition-all shadow-[0_10px_25px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_35px_rgba(212,175,55,0.5)] transform hover:-translate-y-1">
                    {t('hero_cta_primary')}
                  </MagneticButton>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Demo Access Section */}
          <section id="demo" className="py-24 border-t border-white/5 flex flex-col items-center">
            <ScrollReveal delay={0.1}>
              <div className="max-w-md w-full glass-panel p-10 rounded-[40px] border border-gold/20 shadow-[0_0_60px_rgba(212,175,55,0.1)] relative overflow-hidden backdrop-blur-2xl bg-black/40">
                <div className="absolute inset-0 bg-gold/5 blur-3xl pointer-events-none" />
                <div className="text-center mb-10 relative z-10">
                  <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/20">
                     <Smartphone className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="text-3xl font-serif text-white mb-2">Перейти в Демо</h3>
                  <p className="text-white/50 text-sm">Полноразмерная версия гостевого интерфейса.</p>
                </div>
                <form onSubmit={handleDemoSubmit} className="space-y-5 relative z-10">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Ресторан</label>
                    <input
                      value={demoSlug}
                      onChange={(e) => setDemoSlug(e.target.value)}
                      className="w-full px-5 py-4 bg-black/60 border border-white/10 rounded-2xl text-white focus:border-gold outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Столик</label>
                    <input
                      value={demoTable}
                      onChange={(e) => setDemoTable(e.target.value)}
                      className="w-full px-5 py-4 bg-black/60 border border-white/10 rounded-2xl text-white focus:border-gold outline-none transition-colors"
                    />
                  </div>
                  <MagneticButton type="submit" className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/5 text-white rounded-2xl font-medium transition-colors mt-6 flex items-center justify-center gap-2">
                    <ChefHat className="w-5 h-5" /> {t('demo_open')}
                  </MagneticButton>
                </form>
              </div>
            </ScrollReveal>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="py-24 border-t border-white/5">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">{t('faq_title')}</h2>
                <p className="text-white/50 text-lg max-w-2xl mx-auto">Отвечаем на популярные вопросы рестораторов.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm transition-colors hover:border-gold/30 hover:bg-white/10">
                    <button 
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-6 md:p-8 text-left outline-none"
                    >
                      <span className="text-lg md:text-xl font-medium text-white pr-4">{faq.q}</span>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${openFaq === i ? 'bg-gold border-gold text-dark' : 'bg-white/5 border-white/10 text-white/50'}`}>
                         <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${openFaq === i ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 md:p-8 pt-0 text-white/50 leading-relaxed text-base md:text-lg border-t border-white/5 mx-2 md:mx-4 mt-2">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </section>

        </div>
      </main>

      {/* Footer CTA */}
      <footer className="bg-[#050505] border-t border-white/10 py-24 relative overflow-hidden z-10">
        <div className="absolute inset-x-0 bottom-0 h-[600px] bg-gold/5 blur-[120px] pointer-events-none" />
        <ScrollReveal>
          <div className="max-w-7xl mx-auto px-6 text-center space-y-8 relative z-10">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-dark border border-gold/30 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
              <ChefHat className="w-12 h-12 text-gold" />
            </div>
            <h2 className="text-4xl md:text-6xl font-serif text-white tracking-tight">{t('cta_section_title')}</h2>
            <p className="text-white/50 text-xl max-w-2xl mx-auto">{t('cta_section_desc')}</p>
            <div className="pt-8">
              <MagneticButton onClick={() => window.location.href='mailto:contact@qresto.tj'} className="px-10 py-5 bg-white text-black hover:bg-gray-200 rounded-2xl font-semibold text-xl transition-colors shadow-[0_10px_40px_rgba(255,255,255,0.2)] hover:-translate-y-1 transform">
                Оставить заявку
              </MagneticButton>
            </div>
            <div className="mt-32 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-white/40 text-sm gap-4 font-mono">
              <p>© {new Date().getFullYear()} QResto SaaS. All rights reserved.</p>
              <div className="flex gap-8">
                <a href="#" className="hover:text-gold transition-colors block">Privacy Policy</a>
                <a href="#" className="hover:text-gold transition-colors block">Terms of Service</a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </footer>
    </div>
  );
}
