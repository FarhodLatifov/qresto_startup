import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import { Save, KeyRound, Copy } from 'lucide-react';
import ImageUpload from '../../components/admin/ImageUpload';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../hooks/useToast';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];

export default function Settings() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    primary_color: '#D4AF37',
    telegram_chat_id: '',
    logo_url: null as string | null,
  });

  useEffect(() => {
    async function loadRestaurant() {
      try {
        const { data } = await supabase
          .from('restaurants')
          .select('*')
          .eq('owner_id', user?.id || '')
          .limit(1)
          .maybeSingle();
        if (data) {
          setRestaurant(data);
          setFormData({
            name: data.name || '',
            slug: data.slug || '',
            primary_color: data.primary_color || '#D4AF37',
            telegram_chat_id: data.telegram_chat_id || '',
            logo_url: data.logo_url || null,
          });
          if (data.primary_color) {
            document.documentElement.style.setProperty('--color-gold', data.primary_color);
          }
        }
      } catch (error) {
        console.error('Error loading restaurant:', error);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadRestaurant();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      if (restaurant) {
        const { error } = await supabase
          .from('restaurants')
          .update({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            primary_color: formData.primary_color,
            telegram_chat_id: formData.telegram_chat_id.trim() || null,
            logo_url: formData.logo_url,
          })
          .eq('id', restaurant.id);
        if (error) throw error;
        setRestaurant((prev) =>
          prev
            ? {
                ...prev,
                name: formData.name.trim(),
                slug: formData.slug.trim(),
                primary_color: formData.primary_color,
                telegram_chat_id: formData.telegram_chat_id.trim() || null,
                logo_url: formData.logo_url,
              }
            : prev,
        );
        if (formData.primary_color) {
          document.documentElement.style.setProperty('--color-gold', formData.primary_color);
        }
        showToast('Настройки сохранены', 'success');
      } else {
        const { data: newRestaurant, error } = await supabase
          .from('restaurants')
          .insert({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            primary_color: formData.primary_color,
            telegram_chat_id: formData.telegram_chat_id.trim() || null,
            logo_url: formData.logo_url,
            owner_id: user.id,
          })
          .select()
          .single();
        if (error) throw error;
        setRestaurant(newRestaurant);
        showToast('Ресторан создан', 'success');
      }
    } catch (error: any) {
      showToast(`Ошибка: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const generateTrialKey = async () => {
    try {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let randomId = 'QRESTO-';
      for (let i = 0; i < 6; i++) randomId += chars.charAt(Math.floor(Math.random() * chars.length));
      
      const { error } = await supabase.from('license_keys').insert({
        key_string: randomId,
        created_by: user?.id,
        duration_days: 14,
      });
      
      if (error) throw error;
      setGeneratedKey(randomId);
      showToast('Новый 14-дневный ключ успешно создан!', 'success');
    } catch (e: any) {
      showToast('Ошибка генерации ключа: ' + e.message, 'error');
    }
  };

  if (loading) return <div className="text-white/70">Загрузка...</div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-serif text-gold mb-2">Настройки ресторана</h1>
        <p className="text-white/60">Управляйте основной информацией о заведении.</p>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl space-y-6">
        <div className="pb-6 border-b border-white/5">
          <ImageUpload
            value={formData.logo_url}
            onChange={(url) => setFormData((prev) => ({ ...prev, logo_url: url }))}
            folder="logos"
            label="Логотип ресторана"
          />
          <p className="mt-2 text-sm text-white/40">Это изображение будет отображаться в верхней части меню.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">Название ресторана</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">URL (slug)</label>
            <div className="flex items-center">
              <span className="bg-white/5 border border-white/10 border-r-0 rounded-l-xl px-4 py-3 text-white/40">menu/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                className="flex-1 bg-dark/50 border border-white/10 rounded-r-xl px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                placeholder="my-restaurant"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">Основной цвет (HEX)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData((prev) => ({ ...prev, primary_color: e.target.value }))}
                className="w-12 h-12 rounded-xl bg-dark/50 border border-white/10 cursor-pointer"
              />
              <input
                type="text"
                value={formData.primary_color}
                onChange={(e) => setFormData((prev) => ({ ...prev, primary_color: e.target.value }))}
                className="flex-1 bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all uppercase"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">Telegram Chat ID (для уведомлений)</label>
            <input
              type="text"
              value={formData.telegram_chat_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, telegram_chat_id: e.target.value }))}
              className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              placeholder="Например: 123456789 или -100123456789"
            />
            <p className="text-xs text-white/40 mt-1">
              Узнайте ID через <strong>@userinfobot</strong> в Telegram. Обязательно нажмите /start в вашем боте.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-gold text-dark px-8 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {saving ? <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            Сохранить изменения
          </button>
        </div>
      </form>

      {/* Супер-админ блок (Создание ключей) - Доступен только главному админу, а не клиентам с ключами */}
      {user?.email && !user.email.endsWith('@qresto.local') && (
        <div className="glass-panel p-8 rounded-3xl mt-8 border border-gold/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[80px] rounded-full pointer-events-none" />
          <h2 className="text-xl font-serif text-gold mb-2 flex items-center gap-2">
            <KeyRound className="w-5 h-5" /> Генерация ключей доступа (Trial)
          </h2>
          <p className="text-white/60 mb-6 text-sm">
            Создайте уникальный ключ, который вы можете передать владельцу ресторана для 14-дневного бесплатного тестирования платформы. Владельцу нужно будет ввести этот ключ на странице входа.
          </p>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <button
              onClick={generateTrialKey}
              type="button"
              className="bg-white/10 text-white hover:bg-white/20 px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors border border-white/10"
            >
              Создать новый ключ
            </button>
            
            {generatedKey && (
              <div className="flex-1 bg-dark/50 border border-gold/30 rounded-xl px-4 py-3 text-gold font-mono flex items-center justify-between">
                <span className="text-lg">{generatedKey}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedKey);
                    showToast('Скопировано в буфер', 'success');
                  }}
                  className="p-2 hover:bg-gold/10 rounded-lg transition-colors"
                  title="Скопировать"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
