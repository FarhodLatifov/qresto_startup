import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { KeyRound, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { signInWithPassword, signUp } = useAuth();
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isEmail = loginInput.includes('@');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setMessage(null);

    // Принудительно выходим из старого аккаунта, чтобы избежать конфликта сессий
    await supabase.auth.signOut();

    let error;

    if (isEmail) {
      // Стандартный вход для Администратора
      const resAdmin = await signInWithPassword(loginInput.trim(), password);
      error = resAdmin.error;
    } else {
      // Вход по Уникальному Ключу (License Key)
      const key = loginInput.trim().toUpperCase();
      
      const { data: keyData, error: keyError } = await supabase
        .from('license_keys' as any)
        .select('*')
        .eq('key_string', key)
        .single();
        
      if (keyError || !keyData || (keyData as any).status !== 'active') {
         setPending(false);
         setMessage('Неверный или неактивный ключ доступа.');
         return;
      }

      const mappedEmail = `${key}@qresto.local`;
      let resKey = await signInWithPassword(mappedEmail, key);
      
      if (resKey.error && resKey.error.message.includes('Invalid login credentials')) {
          // Ключ валидный, но еще не зарегистрирован в Auth (первый вход)
          resKey = await signUp(mappedEmail, key);
          
          if (!resKey.error) {
              const { data: userData } = await supabase.auth.getUser();
              const uid = userData?.user?.id;
              
              if (uid) {
                 const { data: restData } = await supabase.from('restaurants').insert({
                   name: `Ресторан ${key}`,
                   slug: `rest-${key.toLowerCase()}`,
                   owner_id: uid
                 }).select().single();
                 
                  if (restData) {
                   await supabase.from('license_keys').update({ 
                     restaurant_id: restData.id,
                     activated_at: new Date().toISOString()
                   }).eq('key_string', key);
                 }
              }
          }
      }
      
      error = resKey.error;
    
    }
    
    setPending(false);
    
    if (error) {
       // Делаем ошибки более понятными для клиентов с ключами
      if (error.message.includes('Invalid login credentials')) {
        setMessage('Неверный ключ доступа или пароль.');
      } else {
        setMessage(`Ошибка: ${error.message}`);
      }
    } else {
      navigate((location.state as any)?.from || '/admin');
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Декоративный фон */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gold/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative z-10 shadow-2xl">
        <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mb-6 border border-gold/20">
          <KeyRound className="w-8 h-8 text-gold" />
        </div>
        
        <h1 className="text-3xl font-serif text-white mb-2">QResto Admin</h1>
        <p className="text-white/50 text-sm mb-8">
          Введите ваш уникальный ключ для входа в панель управления.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">
              Уникальный ключ
            </label>
            <div className="relative">
               <input
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="QRESTO-XXXX-XXXX"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-4 text-white placeholder-white/20 focus:border-gold focus:ring-1 focus:ring-gold transition-all outline-none font-mono tracking-wide"
                required
              />
              {isEmail ? (
                <Mail className="w-5 h-5 text-gold absolute right-4 top-1/2 -translate-y-1/2" />
              ) : (
                <KeyRound className="w-5 h-5 text-white/20 absolute right-4 top-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden ${
              isEmail ? 'max-h-24 opacity-100 mt-4' : 'max-h-0 opacity-0 m-0'
            }`}
          >
            <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">
              Пароль администратора
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:border-gold focus:ring-1 focus:ring-gold transition-all outline-none"
              required={isEmail}
            />
          </div>

          <button
            type="submit"
            disabled={pending || !loginInput}
            className="w-full bg-gold text-dark font-medium py-4 rounded-xl hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {pending ? (
              <span className="animate-pulse">Проверка...</span>
            ) : (
              <>
                Войти в панель <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {message && (
            <div className="mt-4 p-4 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-500/20 text-center animate-fade-in">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
