import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import { Database } from '../../types/supabase';
import { Calendar, Clock, Users, Phone, Check, X, User, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../lib/auth';

type Reservation = Database['public']['Tables']['reservations']['Row'];

export default function ReservationManager() {
  const { showToast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function loadReservations() {
      try {
        const { data: restData } = await supabase
          .from('restaurants')
          .select('id')
          .eq('owner_id', user?.id || '')
          .limit(1)
          .maybeSingle();
        if (restData) {
          setRestaurantId(restData.id);
          const { data } = await supabase
            .from('reservations')
            .select('*')
            .eq('restaurant_id', restData.id)
            .order('created_at', { ascending: false });

          if (data) setReservations(data);
        }
      } catch (error) {
        console.error('Error loading reservations:', error);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadReservations();

    const subscription = supabase
      .channel('reservations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReservations((prev) => [payload.new as Reservation, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setReservations((prev) => prev.map((res) => (res.id === payload.new.id ? { ...res, ...payload.new } : res)));
          } else if (payload.eventType === 'DELETE') {
            setReservations((prev) => prev.filter((res) => res.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'accepted' | 'rejected') => {
    const { error } = await supabase.from('reservations').update({ status: newStatus as any }).eq('id', id);
    if (error) {
      showToast(`Ошибка: ${error.message}`, 'error');
    } else {
      showToast('Статус обновлен', 'success');
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">Ожидает</span>;
      case 'accepted':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">Подтверждено</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">Отклонено</span>;
      default:
        return <span className="px-3 py-1 bg-white/10 text-white/60 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const filteredReservations = reservations.filter((res) => (filter === 'all' ? true : res.status === filter));

  if (loading) return <div className="text-white/70">Загрузка...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-gold mb-2">Бронирования</h1>
          <p className="text-white/60">Управляйте заявками на бронирование столиков.</p>
        </div>

        <div className="flex bg-dark/50 p-1 rounded-xl border border-white/5">
          {(['all', 'pending', 'accepted', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-gold text-dark' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {f === 'all' ? 'Все' : f === 'pending' ? 'Ожидают' : f === 'accepted' ? 'Приняты' : 'Отклонены'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {filteredReservations.map((res) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-medium text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-gold" />
                    {res.guest_name}
                  </h3>
                  {getStatusBadge(res.status)}
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {res.guest_phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(res.date).toLocaleDateString('ru-RU')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {res.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {res.party_size} чел.
                  </div>
                </div>

                {res.comment && (
                  <div className="bg-dark/50 p-3 rounded-xl text-sm text-white/80 border border-white/5">
                    <span className="text-white/40 block mb-1">Комментарий:</span>
                    {res.comment}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 md:flex-col lg:flex-row shrink-0 flex-wrap">
                {res.status === 'pending' && (
                  <>
                    <button
                      onClick={async () => {
                        const { error } = await supabase.from('reservations').update({ status: 'accepted' }).eq('id', res.id);
                        if (error) showToast(error.message, 'error');
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-colors font-medium"
                    >
                      <Check className="w-5 h-5" />
                      Принять
                    </button>
                    <button
                      onClick={async () => {
                        const { error } = await supabase.from('reservations').update({ status: 'rejected' }).eq('id', res.id);
                        if (error) showToast(error.message, 'error');
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors font-medium"
                    >
                      <X className="w-5 h-5" />
                      Отклонить
                    </button>
                  </>
                )}
                <button
                  onClick={async () => {
                    const time = prompt('Новое время', res.time) || res.time;
                    const party_size_str = prompt('Кол-во гостей', res.party_size.toString());
                    if (!party_size_str) return;
                    const party_size = parseInt(party_size_str, 10);
                    const { error } = await supabase.from('reservations').update({ time, party_size }).eq('id', res.id);
                    if (error) showToast(error.message, 'error');
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium"
                >
                  <Edit2 className="w-5 h-5" />
                  Править
                </button>
                <button
                  onClick={async () => {
                    if (!confirm('Удалить бронь?')) return;
                    const { error } = await supabase.from('reservations').delete().eq('id', res.id);
                    if (error) showToast(error.message, 'error');
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-red-500/30 text-white rounded-xl transition-colors font-medium"
                >
                  <Trash2 className="w-5 h-5" />
                  Удалить
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredReservations.length === 0 && (
          <div className="text-center py-12 glass-panel rounded-2xl">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-xl text-white/60">
              {filter === 'all' ? 'Пока нет заявок на бронирование' : 'Нет заявок с таким статусом'}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
