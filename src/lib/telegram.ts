// import { supabase } from './supabase';

const TELEGRAM_API_URL = 'https://api.telegram.org/bot';
const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId: string, text: string) {
  if (!BOT_TOKEN) {
    console.error('Ошибка: VITE_TELEGRAM_BOT_TOKEN не найден в .env');
    return null;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_URL}${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API Error: ${errorData.description}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Telegram Fetch Error:', error);
    throw error;
  }
}

export async function sendOrderNotification(params: {
  restaurantName: string;
  chatId: string | null;
  tableNumber: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  comment: string | null;
}) {
  const { restaurantName, chatId, tableNumber, items, totalAmount, comment } = params;
  if (!chatId) return;

  const itemsList = items
    .map((item) => `- ${item.name} x${item.quantity} = ${item.price * item.quantity} TJS`)
    .join('\n');

  const text = `
🆕 <b>Новый заказ!</b>
🏢 Ресторан: ${restaurantName}
🍽 Стол: #${tableNumber}

<b>Состав заказа:</b>
${itemsList}

📝 Комментарий: ${comment || 'Нет'}
💰 <b>Итого: ${totalAmount} TJS</b>
  `.trim();

  try {
    return await sendTelegramMessage(chatId, text);
  } catch (error) {
    console.error('Error sending order notification:', error);
  }
}

export async function sendReservationNotification(params: {
  restaurantName: string;
  chatId: string | null;
  guestName: string;
  guestPhone: string;
  date: string;
  time: string;
  partySize: number;
  comment: string | null;
}) {
  const { restaurantName, chatId, guestName, guestPhone, date, time, partySize, comment } = params;
  if (!chatId) return;

  const text = `
📅 <b>Новая заявка на бронирование!</b>
🏢 Ресторан: ${restaurantName}

👤 Имя: ${guestName}
📞 Телефон: ${guestPhone}
🗓 Дата и время: ${date} в ${time}
👥 Гостей: ${partySize}
📝 Комментарий: ${comment || 'Нет'}
  `.trim();

  try {
    return await sendTelegramMessage(chatId, text);
  } catch (error) {
    console.error('Error sending reservation notification:', error);
  }
}

export async function sendStaffCallNotification(params: {
  restaurantName: string;
  chatId: string | null;
  tableNumber: string;
  callType: string;
  notes?: string | null;
}) {
  const { restaurantName, chatId, tableNumber, callType, notes } = params;
  if (!chatId) return;

  const typeLabels: Record<string, string> = {
    waiter: 'Позвать официанта',
    bill: 'Счет',
    cleaning: 'Уборка',
    other: 'Другое',
  };

  const text = `
🔔 <b>Вызов персонала!</b>
🏢 Ресторан: ${restaurantName}
🍽 Стол: #${tableNumber}

🎯 Тип: ${typeLabels[callType] || callType}
📝 Заметка: ${notes || 'Нет'}
  `.trim();

  try {
    return await sendTelegramMessage(chatId, text);
  } catch (error) {
    console.error('Error sending staff call notification:', error);
  }
}
