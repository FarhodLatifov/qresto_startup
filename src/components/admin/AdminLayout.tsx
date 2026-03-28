import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, QrCode, Settings, LogOut, CalendarDays } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export function AdminLayout() {
  const location = useLocation();
  const { user, loading, signOut } = useAuth();

  const navigation = [
    { name: 'Дашборд', href: '/admin', icon: LayoutDashboard },
    { name: 'Бронирования', href: '/admin/reservations', icon: CalendarDays },
    { name: 'Меню', href: '/admin/menu', icon: UtensilsCrossed },
    { name: 'QR Коды', href: '/admin/qr', icon: QrCode },
    { name: 'Настройки', href: '/admin/settings', icon: Settings },
  ];

  if (!loading && !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h1 className="font-serif text-2xl text-gold">QResto Admin</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-gold text-dark font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
