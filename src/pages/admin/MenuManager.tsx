import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import { Plus, Edit2, Trash2, GripVertical, UtensilsCrossed, X, Check } from 'lucide-react';
import ImageUpload from '../../components/admin/ImageUpload';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../hooks/useToast';

type Category = Database['public']['Tables']['categories']['Row'];
type Dish = Database['public']['Tables']['dishes']['Row'];

type DishFormState = {
  id?: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category_id?: string | null;
};

export default function MenuManager() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [editDish, setEditDish] = useState<Dish | null>(null);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [dishForm, setDishForm] = useState<DishFormState>({
    name: '',
    description: '',
    price: '',
    image_url: '',
  });

  useEffect(() => {
    async function loadMenu() {
      try {
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

        setRestaurantId(restData.id);

        const [catRes, dishRes] = await Promise.all([
          supabase.from('categories').select('*').eq('restaurant_id', restData.id).order('sort_order'),
          supabase.from('dishes').select('*').eq('restaurant_id', restData.id),
        ]);

        if (catRes.data) setCategories(catRes.data);
        if (dishRes.data) setDishes(dishRes.data);
      } catch (error) {
        console.error('Error loading menu:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) loadMenu();
  }, [user]);

  const resetDishForm = () => {
    setDishForm({ name: '', description: '', price: '', image_url: '', category_id: activeCategoryId });
    setEditDish(null);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || !newCategoryName.trim()) return;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        restaurant_id: restaurantId,
        name: newCategoryName.trim(),
        sort_order: categories.length + 1,
        is_visible: true,
      })
      .select()
      .single();

    if (error) {
      showToast(error.message, 'error');
      return;
    }
    showToast('Блюдо добавлено', 'success');

    setCategories((prev) => [...prev, data]);
    setIsCategoryModalOpen(false);
    setNewCategoryName('');
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || !activeCategoryId) return;

    const payload = {
      restaurant_id: restaurantId,
      category_id: activeCategoryId,
      name: dishForm.name.trim(),
      description: dishForm.description.trim() || null,
      price: parseFloat(dishForm.price),
      image_url: dishForm.image_url.trim() || null,
      is_available: true,
      is_popular: false,
    };

    if (editDish) {
      const { data, error } = await supabase
        .from('dishes')
        .update(payload)
        .eq('id', editDish.id)
        .select()
        .single();
      if (error) return showToast(error.message, 'error');
      setDishes((prev) => prev.map((d) => (d.id === editDish.id ? data : d)));
      showToast('Блюдо обновлено', 'success');
    } else {
      const { data, error } = await supabase.from('dishes').insert(payload).select().single();
      if (error) return showToast(error.message, 'error');
      setDishes((prev) => [...prev, data]);
      showToast('Блюдо добавлено', 'success');
    }

    setIsDishModalOpen(false);
    resetDishForm();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Удалить категорию и все ее блюда?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      showToast(`Ошибка при удалении категории: ${error.message}`, 'error');
      return;
    }
    showToast('Категория удалена', 'success');
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setDishes((prev) => prev.filter((d) => d.category_id !== id));
  };

  const handleDeleteDish = async (id: string) => {
    if (!confirm('Удалить блюдо?')) return;
    const { error } = await supabase.from('dishes').delete().eq('id', id);
    if (error) {
      showToast(`Ошибка при удалении блюда: ${error.message}`, 'error');
      return;
    }
    showToast('Блюдо удалено', 'success');
    setDishes((prev) => prev.filter((d) => d.id !== id));
  };

  const handleToggleAvailability = async (dish: Dish) => {
    const { data, error } = await supabase
      .from('dishes')
      .update({ is_available: !dish.is_available })
      .eq('id', dish.id)
      .select()
      .single();
    
    if (error) {
      showToast(`Ошибка: ${error.message}`, 'error');
      return;
    }
    showToast('Статус обновлен', 'success');

    if (data) setDishes((prev) => prev.map((d) => (d.id === dish.id ? data : d)));
  };

  const categoriesWithDishes = useMemo(
    () => categories.map((c) => ({ ...c, dishes: dishes.filter((d) => d.category_id === c.id) })),
    [categories, dishes],
  );

  if (loading) {
    return <div className="text-white/70">Загрузка меню…</div>;
  }

  if (!restaurantId) {
    return <div className="text-white/70">Ресторан не найден. Создайте ресторан в настройках.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-gold mb-2">Управление меню</h1>
          <p className="text-white/60">Добавляйте и редактируйте категории и блюда.</p>
        </div>
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="bg-gold text-dark px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-gold/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Добавить категорию
        </button>
      </div>

      <div className="space-y-6">
        {categoriesWithDishes.map((category) => (
          <div key={category.id} className="glass-panel rounded-2xl overflow-hidden">
            <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-white/20 cursor-grab" />
                <h2 className="text-xl font-medium text-white">{category.name}</h2>
                {!category.is_visible && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">Скрыта</span>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 text-white/40 hover:text-white transition-colors"
                  onClick={async () => {
                    const name = prompt('Новое название категории', category.name);
                    if (!name || name === category.name) return;
                    const { error } = await supabase.from('categories').update({ name }).eq('id', category.id);
                    if (error) {
                      showToast(error.message, 'error');
                      return;
                    }
                    showToast('Категория обновлена', 'success');
                    setCategories((prev) => prev.map((c) => (c.id === category.id ? { ...c, name } : c)));
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 text-white/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {category.dishes.length > 0 ? (
                <div className="space-y-4">
                  {category.dishes.map((dish) => (
                    <div key={dish.id} className="flex items-center justify-between bg-dark/50 p-4 rounded-xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <GripVertical className="w-5 h-5 text-white/20 cursor-grab" />
                        {dish.image_url ? (
                          <img src={dish.image_url} alt={dish.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                            <UtensilsCrossed className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-white">{dish.name}</h3>
                          <p className="text-gold text-sm">{dish.price} TJS</p>
                          {dish.description && <p className="text-white/50 text-xs">{dish.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!dish.is_available && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full mr-2">Нет в наличии</span>
                        )}
                        <button
                          className="p-2 text-white/40 hover:text-white transition-colors"
                          onClick={() => {
                            setActiveCategoryId(dish.category_id);
                            setEditDish(dish);
                            setDishForm({
                              id: dish.id,
                              name: dish.name,
                              description: dish.description || '',
                              price: dish.price.toString(),
                              image_url: dish.image_url || '',
                              category_id: dish.category_id,
                            });
                            setIsDishModalOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDish(dish.id)}
                          className="p-2 text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleAvailability(dish)}
                          className="p-2 text-white/40 hover:text-green-400 transition-colors"
                          title="Переключить доступность"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-center py-4">В этой категории пока нет блюд</p>
              )}

              <button
                onClick={() => {
                  setActiveCategoryId(category.id);
                  resetDishForm();
                  setIsDishModalOpen(true);
                }}
                className="mt-4 w-full py-3 border border-dashed border-white/20 rounded-xl text-white/60 hover:text-white hover:border-gold/50 hover:bg-gold/5 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Добавить блюдо
              </button>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12 glass-panel rounded-2xl">
            <h3 className="text-xl text-white/60 mb-4">У вас пока нет категорий</h3>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-gold text-dark px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 hover:bg-gold/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Создать первую категорию
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-dark border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-serif text-gold">Новая категория</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddCategory} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Название</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                    placeholder="Например: Горячие блюда"
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-gold text-dark font-medium py-3 rounded-xl hover:bg-gold/90 transition-colors">
                  Сохранить
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDishModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-dark border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-serif text-gold">{editDish ? 'Редактировать блюдо' : 'Новое блюдо'}</h3>
                <button
                  onClick={() => {
                    setIsDishModalOpen(false);
                    resetDishForm();
                  }}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveDish} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Название</label>
                  <input
                    type="text"
                    value={dishForm.name}
                    onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Описание</label>
                  <textarea
                    value={dishForm.description}
                    onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none h-24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Цена (TJS)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                    required
                  />
                </div>
                <ImageUpload
                  value={dishForm.image_url}
                  onChange={(url) => setDishForm({ ...dishForm, image_url: url || '' })}
                  folder="dishes"
                  label="Фото блюда"
                />
                <button type="submit" className="w-full bg-gold text-dark font-medium py-3 rounded-xl hover:bg-gold/90 transition-colors mt-2">
                  Сохранить
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
