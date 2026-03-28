import { useEffect, useState } from 'react';
import { ShoppingBag, TrendingUp, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import { Database } from '../../types/supabase';
import { useAuth } from '../../lib/auth';

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: (Database['public']['Tables']['order_items']['Row'] & {
    dish: Database['public']['Tables']['dishes']['Row'];
  })[];
  table: Database['public']['Tables']['tables']['Row'] | null;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    todayGuests: 0,
  });

  useEffect(() => {
    loadDashboardData();

    // Setup Realtime Subscription
    const subscription = supabase
      .channel('admin_orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          loadDashboardData(); // Reload all data for consistency
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadDashboardData() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: restData } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user?.id || '')
        .limit(1)
        .maybeSingle();

      if (!restData) {
        setLoading(false);
        return;
      }

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            dish: dishes (*)
          ),
          table: tables (
            table_number
          )
        `)
        .eq('restaurant_id', restData.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedOrders = (ordersData || []).map(order => ({
        ...order,
        table: order.table as any
      })) as unknown as Order[];

      setOrders(typedOrders);

      // Calculate stats
      const todayOrders = typedOrders.length;
      const todayRevenue = typedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const todayGuests = typedOrders.reduce((sum, order) => {
        return sum + order.order_items.reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0);

      setStats({
        todayOrders,
        todayRevenue,
        todayGuests,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus as any })
      .eq('id', orderId);
    if (error) {
      showToast('Ошибка при обновлении статуса', 'error');
      return;
    }
    showToast('Статус обновлен', 'success');
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-indigo-400" />;
      case 'preparing':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Новый',
      confirmed: 'Подтвержден',
      preparing: 'Готовится',
      completed: 'Выполнен',
      cancelled: 'Отменен',
    };
    return statusMap[status] || status;
  };

  const displayStats = [
    { name: 'Заказы сегодня', value: stats.todayOrders.toString(), icon: ShoppingBag },
    { name: 'Выручка', value: `${stats.todayRevenue.toLocaleString()} TJS`, icon: TrendingUp },
    { name: 'Гости (порций)', value: stats.todayGuests.toString(), icon: Users },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-gold mb-2">Дашборд</h1>
        <p className="text-white/60">Обзор показателей вашего ресторана.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="glass-panel p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gold">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-white/60 text-sm font-medium mb-1">{stat.name}</h3>
              <p className="text-3xl font-serif text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-xl font-serif text-gold mb-6">Последние заказы</h2>
        {loading ? (
          <div className="text-center py-12 text-white/40">Загрузка...</div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-gold/20 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="text-sm text-white/60">{getStatusText(order.status)}</span>
                    </div>
                    {order.table && (
                      <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded-full">
                        Стол #{order.table.table_number}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-serif text-gold">{order.total_amount} TJS</p>
                    <p className="text-xs text-white/40">
                      {new Date(order.created_at).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-white/70">
                        {item.quantity} × {item.dish?.name || 'Блюдо удалено'}
                      </span>
                      <span className="text-white/40">{(item.price || 0) * item.quantity} TJS</span>
                    </div>
                  ))}
                  {order.comment && (
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <p className="text-xs text-white/50 italic">💬 {order.comment}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors"
                    >
                      Подтвердить
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium hover:bg-yellow-500/30 transition-colors"
                    >
                      Готовить
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-colors"
                    >
                      Готов
                    </button>
                  )}
                  {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="px-3 py-1.5 bg-red-500/10 text-red-500/60 rounded-lg text-xs font-medium hover:bg-red-500/20 hover:text-red-400 transition-colors ml-auto"
                    >
                      Отменить
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/40">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Пока нет новых заказов</p>
          </div>
        )}
      </div>
    </div>
  );
}


