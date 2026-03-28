import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { Calendar, Clock, Users, User, Phone, MessageSquare, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { sendReservationNotification } from '../lib/telegram';
import { useToast } from '../hooks/useToast';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];

export default function ReservationPage() {
  const { slug } = useParams<{ slug: string }>();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    comment: ''
  });

  useEffect(() => {
    async function fetchRestaurant() {
      if (!slug) return;
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setRestaurant(data);
          if (data.primary_color) {
            document.documentElement.style.setProperty('--color-gold', data.primary_color);
          }
        } else if (slug === 'demo-rest') {
          setRestaurant({
            id: 'demo-id',
            owner_id: 'demo-owner',
            name: 'Navruz Palace (Demo)',
            slug: 'demo-rest',
            logo_url: null,
            primary_color: '#D4AF37',
            telegram_chat_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as Restaurant);
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    
    setSubmitting(true);

    if (slug === 'demo-rest') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('reservations')
        .insert({
          restaurant_id: restaurant.id,
          guest_name: formData.name,
          guest_phone: formData.phone,
          date: formData.date,
          time: formData.time,
          party_size: formData.guests === '10+' ? 10 : parseInt(formData.guests),
          status: 'pending',
          comment: formData.comment || null
        });

      if (error) throw error;
      
      if (restaurant.telegram_chat_id) {
        await sendReservationNotification({
          restaurantName: restaurant.name,
          chatId: restaurant.telegram_chat_id,
          guestName: formData.name,
          guestPhone: formData.phone,
          date: formData.date,
          time: formData.time,
          partySize: formData.guests === '10+' ? 10 : parseInt(formData.guests),
          comment: formData.comment || null
        }).catch(err => console.error('Telegram notification failed:', err));
      }
      
      setSuccess(true);
    } catch (error) {
      console.error('Error creating reservation:', error);
      showToast('Произошла ошибка при бронировании. Пожалуйста, попробуйте позже.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-dark flex items-center justify-center text-white/60">Загрузка...</div>;
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 rounded-3xl max-w-md">
          <h1 className="font-serif text-3xl text-gold mb-4">Ресторан не найден</h1>
          <p className="text-white/60">Пожалуйста, проверьте правильность ссылки.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-3xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-serif text-gold mb-4">Заявка отправлена!</h2>
          <p className="text-white/70 mb-8">
            Мы получили вашу заявку на бронирование. Администратор свяжется с вами в ближайшее время для подтверждения.
          </p>
          <button 
            onClick={() => navigate(`/menu/${slug}/1`)}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
          >
            Посмотреть меню
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="mb-10 flex items-center gap-6">
          {restaurant.logo_url && (
            <img src={restaurant.logo_url} alt="Logo" className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
          )}
          <div>
            <h1 className="text-4xl font-serif text-gold mb-2">Бронирование столика</h1>
            <p className="text-white/60 text-lg">в ресторане {restaurant.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 rounded-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                <User className="w-4 h-4" /> Ваше имя
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                placeholder="Иван Иванов"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Номер телефона
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                placeholder="+992 00 000 0000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Дата
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all [color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Время
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
                className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all [color-scheme:dark]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                <Users className="w-4 h-4" /> Количество гостей
              </label>
              <select
                value={formData.guests}
                onChange={e => setFormData({...formData, guests: e.target.value})}
                className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all appearance-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '10+'].map(num => (
                  <option key={num} value={num} className="bg-dark">{num} {num === 1 ? 'человек' : 'человек'}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Пожелания (необязательно)
              </label>
              <textarea
                value={formData.comment}
                onChange={e => setFormData({...formData, comment: e.target.value})}
                className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none h-24"
                placeholder="Например: столик у окна, детский стульчик..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold text-dark font-medium py-4 rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {submitting ? (
              <div className="w-6 h-6 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
            ) : (
              'Забронировать столик'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
