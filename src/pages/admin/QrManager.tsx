import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import { Plus, Download, Trash2, Edit2, QrCode } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../hooks/useToast';

type Table = Database['public']['Tables']['tables']['Row'];

export default function QrManager() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    async function loadTables() {
      try {
        const { data: restData } = await supabase
          .from('restaurants')
          .select('id, slug')
          .eq('owner_id', user?.id || '')
          .limit(1)
          .maybeSingle();
        if (restData) {
          setRestaurantId(restData.id);
          setSlug(restData.slug);
          const { data } = await supabase
            .from('tables')
            .select('*')
            .eq('restaurant_id', restData.id)
            .order('table_number');
          if (data) setTables(data);
        }
      } catch (error: any) {
        showToast(`Ошибка при загрузке: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }
    if (user) loadTables();
  }, [user, showToast]);

  const handleAddTable = async () => {
    if (!restaurantId) return;
    const tableNumber = prompt('Введите номер столика:');
    if (!tableNumber) return;

    const { data, error } = await supabase
      .from('tables')
      .insert({ restaurant_id: restaurantId, table_number: tableNumber })
      .select()
      .single();
    if (error) {
      showToast(`Ошибка: ${error.message}`, 'error');
      return;
    }
    showToast('Столик добавлен', 'success');
    setTables((prev) => [...prev, data].sort((a, b) => a.table_number.localeCompare(b.table_number)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот столик?')) return;
    const { error } = await supabase.from('tables').delete().eq('id', id);
    if (error) return showToast(error.message, 'error');
    setTables((prev) => prev.filter((t) => t.id !== id));
    showToast('Столик удален', 'success');
  };

  const handleEdit = async (table: Table) => {
    const newNumber = prompt('Новый номер столика', table.table_number);
    if (!newNumber || newNumber === table.table_number) return;
    const { data, error } = await supabase
      .from('tables')
      .update({ table_number: newNumber })
      .eq('id', table.id)
      .select()
      .single();
    if (error) return showToast(error.message, 'error');
    setTables((prev) => prev.map((t) => (t.id === table.id ? data : t)).sort((a, b) => a.table_number.localeCompare(b.table_number)));
    showToast('Столик обновлен', 'success');
  };

  const qrUrl = (tableNumber: string) => {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
      `${baseUrl}/menu/${slug ?? 'demo-rest'}/${tableNumber}`,
    )}`;
  };

  if (loading) return <div className="text-white/70">Загрузка...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-gold mb-2">Управление QR-кодами</h1>
          <p className="text-white/60">Создавайте столики и скачивайте QR-коды для них.</p>
        </div>
        <button
          onClick={handleAddTable}
          className="bg-gold text-dark px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-gold/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Добавить столик
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <div key={table.id} className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center relative group">
            <button
              onClick={() => handleDelete(table.id)}
              className="absolute top-4 right-4 p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(table)}
              className="absolute top-4 left-4 p-2 text-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <div className="w-32 h-32 bg-white rounded-2xl p-2 mb-4 flex items-center justify-center">
              <img src={qrUrl(table.table_number)} alt="QR code" className="w-full h-full rounded-xl object-cover" />
            </div>

            <h3 className="text-xl font-serif text-white mb-1">Столик #{table.table_number}</h3>
            <p className="text-sm text-white/40 mb-6 font-mono truncate w-full px-4">
              /menu/{slug ?? 'demo-rest'}/{table.table_number}
            </p>

            <a
              href={qrUrl(table.table_number)}
              download={`qr-${table.table_number}.png`}
              className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Скачать QR
            </a>
          </div>
        ))}

        {tables.length === 0 && (
          <div className="col-span-full text-center py-12 glass-panel rounded-2xl">
            <QrCode className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-xl text-white/60 mb-4">У вас пока нет столиков</h3>
            <button
              onClick={handleAddTable}
              className="bg-gold text-dark px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 hover:bg-gold/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Создать первый столик
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
