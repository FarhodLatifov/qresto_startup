import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Bell, Receipt, Calendar, Search, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { DishCard } from '../components/menu/DishCard';
import { Skeleton } from '../components/ui/Skeleton';
import { CartModal, CartItem } from '../components/menu/CartModal';
import { ReservationModal } from '../components/menu/ReservationModal';
import { sendOrderNotification, sendReservationNotification } from '../lib/telegram';
import { useToast } from '../hooks/useToast';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Dish = Database['public']['Tables']['dishes']['Row'];

export default function GuestMenu() {
  const { slug, tableId } = useParams<{ slug: string; tableId: string }>();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [table, setTable] = useState<Database['public']['Tables']['tables']['Row'] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleReservation = async (data: {
    guestName: string;
    guestPhone: string;
    date: string;
    time: string;
    partySize: number;
    comment: string;
  }) => {
    if (!restaurant) return;

    try {
      const { error } = await supabase.from('reservations').insert({
        restaurant_id: restaurant.id,
        guest_name: data.guestName,
        guest_phone: data.guestPhone,
        date: data.date,
        time: data.time,
        party_size: data.partySize,
        status: 'pending',
        comment: data.comment || null,
      });

      if (error) throw error;

      try {
        await sendReservationNotification({
          restaurantName: restaurant.name,
          chatId: restaurant.telegram_chat_id,
          guestName: data.guestName,
          guestPhone: data.guestPhone,
          date: data.date,
          time: data.time,
          partySize: data.partySize,
          comment: data.comment,
        }).catch(err => console.error('Telegram notification failed:', err));

        showToast('Бронирование отправлено! Мы свяжемся с вами в ближайшее время.', 'success');
        setIsReservationOpen(false);
      } catch (err) {
        // Notification failed but DB insert succeeded, still show success to user
        showToast('Бронирование отправлено! Мы свяжемся с вами в ближайшее время.', 'success');
        setIsReservationOpen(false);
      }
    } catch (error: any) {
      console.error('Reservation error:', error);
      showToast(`Ошибка при бронировании: ${error.message}`, 'error');
    }
  };

  const handleAddToCart = (dish: Dish) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const handlePlaceOrder = async (comment: string) => {
    if (!restaurant || !table) {
      showToast('Ошибка: Ресторан или столик не найден.', 'error');
      return;
    }

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: restaurant.id,
          table_id: table.id,
          status: 'pending',
          total_amount: cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0),
          comment: comment || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const { error: itemsError } = await supabase.from('order_items').insert(
        cart.map((item) => ({
          order_id: order.id,
          dish_id: item.dish.id,
          quantity: item.quantity,
          price: item.dish.price,
        })),
      );

      if (itemsError) throw itemsError;

      await sendOrderNotification({
        restaurantName: restaurant.name,
        chatId: restaurant.telegram_chat_id,
        tableNumber: table.table_number,
        orderId: order.id,
        items: cart.map((item) => ({
          name: item.dish.name,
          quantity: item.quantity,
          price: item.dish.price,
        })),
        totalAmount: cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0),
        comment: comment || '',
      });

      setCart([]);
      setIsCartOpen(false);
      showToast('Заказ оформлен! Скоро подадим.', 'success');
    } catch (error: any) {
      console.error('Order error:', error);
      showToast(`Ошибка при создании заказа: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const { data: restaurantData } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', slug)
          .limit(1)
          .single();

        if (!restaurantData) {
          setLoading(false);
          return;
        }

        setRestaurant(restaurantData);
        if (restaurantData.primary_color) {
          document.documentElement.style.setProperty('--color-gold', restaurantData.primary_color);
        }

        // Fetch table info
        if (tableId) {
          const { data: tableData } = await supabase
            .from('tables')
            .select('*')
            .eq('restaurant_id', restaurantData.id)
            .eq('table_number', tableId)
            .maybeSingle();
          if (tableData) setTable(tableData);
        }

        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('restaurant_id', restaurantData.id)
          .eq('is_visible', true)
          .order('sort_order');

        const { data: dishesData } = await supabase
          .from('dishes')
          .select('*')
          .eq('restaurant_id', restaurantData.id)
          .eq('is_available', true);

        setCategories(categoriesData || []);
        setDishes(dishesData || []);
        setActiveCategory(categoriesData?.[0]?.id || null);
      } catch (error) {
        console.error('Error loading menu:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug, tableId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0B0B10] to-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0B0B10] to-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-serif text-3xl text-gold mb-4">Ресторан не найден</h1>
          <p className="text-white/60">Пожалуйста, проверьте правильность отсканированного QR-кода.</p>
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = !activeCategory || dish.category_id === activeCategory;
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (dish.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0B0B10] to-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-white/50">Добро пожаловать</p>
            <div className="flex items-center gap-4">
              {restaurant.logo_url && (
                <img src={restaurant.logo_url} alt="Logo" className="w-16 h-16 rounded-2xl object-cover" />
              )}
              <h1 className="font-serif text-4xl md:text-5xl text-gold">{restaurant.name}</h1>
            </div>
            <p className="text-white/60">
              {tableId ? `Закажите прямо со столика #${tableId}` : 'Выберите любимые блюда'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReservationOpen(true)}
              className="bg-white/10 text-white px-4 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-white/20 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              <span className="hidden sm:inline">Забронировать</span>
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-gold text-dark px-4 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-gold/90 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">Корзина</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-dark text-gold text-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Поиск блюд..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:border-gold focus:ring-1 focus:ring-gold transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/4 flex md:flex-col gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide sticky top-6 z-10 bg-black/50 backdrop-blur-md -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setActiveCategory(null)}
              className={`whitespace-nowrap px-4 py-3 rounded-xl transition-all ${
                activeCategory === null
                  ? 'bg-gold text-dark font-medium shadow-lg'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Все
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`whitespace-nowrap px-4 py-3 rounded-xl transition-all ${
                  activeCategory === category.id
                    ? 'bg-gold text-dark font-medium shadow-lg'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredDishes.map((dish) => (
                <motion.div
                  key={dish.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <DishCard 
                    dish={dish} 
                    onAdd={() => handleAddToCart(dish)} 
                    quantity={cart.find(item => item.dish.id === dish.id)?.quantity}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredDishes.length === 0 && (
              <div className="col-span-full text-center py-12 glass-panel rounded-2xl">
                <p className="font-serif italic">В этой категории пока нет блюд.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={(dishId, delta) => {
          setCart((prev) =>
            prev
              .map((item) => (item.dish.id === dishId ? { ...item, quantity: item.quantity + delta } : item))
              .filter((item) => item.quantity > 0),
          );
        }}
        onPlaceOrder={handlePlaceOrder}
      />

      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        onSubmit={handleReservation}
      />
    </div>
  );
}
