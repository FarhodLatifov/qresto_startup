import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

type Lang = 'ru' | 'en';
type Dict = Record<string, { ru: string; en: string }>;

const dict: Dict = {
  landing_title: { ru: 'QR-Меню для Ресторанов', en: 'QR Menu for Restaurants' },
  landing_subtitle: {
    ru: 'Премиальная платформа для Таджикистана. Элегантный дизайн, быстрые заказы и бронирование без установки приложений.',
    en: 'Premium platform for Tajikistan. Elegant design, fast orders and reservations without app installation.',
  },
  demo_open: { ru: 'Демо-версия', en: 'Live Demo' },
  not_found_restaurant: { ru: 'Ресторан не найден', en: 'Restaurant not found' },
  check_qr: { ru: 'Проверьте правильность QR-кода.', en: 'Check the scanned QR code.' },
  
  // New keys for Landing Page
  nav_features: { ru: 'Возможности', en: 'Features' },
  nav_pricing: { ru: 'Тарифы', en: 'Pricing' },
  nav_login: { ru: 'Войти', en: 'Login' },
  
  hero_cta_primary: { ru: 'Подключить ресторан', en: 'Connect Restaurant' },
  
  steps_title: { ru: 'Ваш ресторан в новом формате', en: 'Your restaurant in a new format' },
  step1_title: { ru: '1. Скан QR-кода', en: '1. Scan QR Code' },
  step1_desc: { ru: 'Гость сканирует код на столике камерой смартфона. Нет нужды скачивать приложение.', en: 'Guest scans the code on the table with a smartphone. No need to download an app.' },
  step2_title: { ru: '2. Выбор блюд', en: '2. Choose Dishes' },
  step2_desc: { ru: 'Удобное красочное меню с фотографиями и подробным описанием каждого блюда.', en: 'Convenient colorful menu with photos and detailed descriptions of each dish.' },
  step3_title: { ru: '3. Быстрый заказ', en: '3. Fast Order' },
  step3_desc: { ru: 'Моментальная отправка заказа на кухню и уведомление официантам в Telegram.', en: 'Instant dispatch of the order to the kitchen and notification to waiters in Telegram.' },
  
  pricing_title: { ru: 'Прозрачные тарифы', en: 'Transparent Pricing' },
  pricing_basic: { ru: 'Базовый', en: 'Basic' },
  pricing_pro: { ru: 'Профессиональный', en: 'Professional' },
  pricing_popular: { ru: 'Хит', en: 'Popular' },
  feature_qr: { ru: 'Безлимитные QR-коды', en: 'Unlimited QR codes' },
  feature_menu: { ru: 'Каталог блюд', en: 'Menu catalog' },
  feature_tg: { ru: 'Уведомления в Telegram', en: 'Telegram notifications' },
  feature_stats: { ru: 'Аналитика и Дашборд', en: 'Analytics & Dashboard' },
  pricing_cta: { ru: 'Начать бесплатно', en: 'Start for free' },
  
  // FAQ & Calculator
  calc_title: { ru: 'Рассчитайте вашу выгоду', en: 'Calculate your ROI' },
  calc_tables: { ru: 'Количество столов', en: 'Number of tables' },
  calc_check: { ru: 'Средний чек (TJS)', en: 'Average check (TJS)' },
  calc_saved_time: { ru: 'Сэкономлено часов/мес', en: 'Hours saved/mo' },
  calc_extra_revenue: { ru: 'Доп. выручка/мес (TJS)', en: 'Extra revenue/mo (TJS)' },
  
  faq_title: { ru: 'Частые вопросы', en: 'FAQ' },
  faq_q1: { ru: 'Нужно ли скачивать приложение гостям?', en: 'Do guests need to download an app?' },
  faq_a1: { ru: 'Обычно нет — меню открывается прямо в браузере. Приложение для чтения QR-кодов нужно только если камера старого смартфона не поддерживает эту функцию.', en: 'Usually no — the menu opens directly in the browser. A QR scanner app is only needed if an old smartphone camera lacks this feature.' },
  faq_q2: { ru: 'Сложно ли обновлять меню и цены?', en: 'Is it hard to update the menu and prices?' },
  faq_a2: { ru: 'Это делается в пару кликов через удобную админ-панель. Все изменения в меню и ценах моментально отображаются у гостей.', en: 'It is done in a couple of clicks via a convenient admin panel. All changes in menus and prices are instantly visible to guests.' },
  faq_q3: { ru: 'Работает ли система без интернета?', en: 'Does the system work without internet?' },
  faq_a3: { ru: 'Для просмотра меню гостю нужен мобильный интернет или Wi-Fi заведения. Мы можем помочь настроить локальную сеть для работы без глобального интернета (опционально).', en: 'To view the menu, the guest needs mobile internet or the establishment\'s Wi-Fi. We can help set up a local network for offline work (optional).' },

  cta_section_title: { ru: 'Готовы оцифровать свой бизнес?', en: 'Ready to digitize your business?' },
  cta_section_desc: { ru: 'Оставьте заявку, и мы бесплатно настроим меню для вашего заведения.', en: 'Leave a request and we will customize the menu for your establishment for free.' },
};


const I18nContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (key: keyof typeof dict) => string }>({
  lang: 'ru',
  setLang: () => undefined,
  t: () => '',
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ru');
  const value = useMemo(() => ({ lang, setLang, t: (key: keyof typeof dict) => dict[key]?.[lang] ?? key }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
