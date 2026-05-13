import admin from 'firebase-admin';

// Инициализация Firebase Admin
// Мы ждем, что JSON с ключами будет лежать в переменной окружения как строка
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const botToken = process.env.TELEGRAM_BOT_TOKEN;

async function checkDiscounts() {
  console.log("Запуск проверки скидок...");
  
  // 1. Получаем всех пользователей, у которых есть telegramId
  const usersSnapshot = await db.collection('users').where('telegramId', '!=', null).get();
  
  if (usersSnapshot.empty) {
    console.log("Пользователей с привязанным Telegram не найдено.");
    return;
  }
  
  console.log(`Найдено пользователей с ТГ: ${usersSnapshot.size}`);
  
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const { telegramId, wishlist } = userData;
    
    if (!wishlist || wishlist.length === 0) continue;
    
    console.log(`Проверяем вишлист для пользователя ${userDoc.id} (TG: ${telegramId})...`);
    
    // Извлекаем ID игр из вишлиста
    const gameIds = wishlist.map(game => game.id).filter(Boolean);
    
    if (gameIds.length === 0) continue;
    
    // CheapShark позволяет запрашивать до 25 игр за раз через запятую
    const idsParam = gameIds.slice(0, 25).join(',');
    
    try {
      const response = await fetch(`https://www.cheapshark.com/api/1.0/games?ids=${idsParam}`);
      if (!response.ok) {
        console.error(`Ошибка CheapShark API: ${response.status}`);
        continue;
      }
      
      const gamesData = await response.json();
      
      // Проверяем каждую игру
      for (const game of wishlist) {
        const currentData = gamesData[game.id];
        if (!currentData) continue;
        
        const deals = currentData.deals;
        if (!deals || deals.length === 0) continue;
        
        // Ищем лучшую цену среди предложений
        const prices = deals.map(d => parseFloat(d.price));
        const bestPrice = Math.min(...prices);
        
        // Берем розничную цену из первой сделки (обычно она одинаковая)
        const retailPrice = parseFloat(deals[0].retailPrice);
        
        if (bestPrice < retailPrice) {
          const savings = Math.round((1 - bestPrice / retailPrice) * 100);
          
          // Уведомляем, если скидка больше 5%
          if (savings >= 5) {
            const message = `🔥 *Скидка на игру из вашего избранного!*\n\n` +
                            `👾 *${game.title}*\n` +
                            `💰 Текущая лучшая цена: $${bestPrice} (Скидка ${savings}%)\n\n` +
                            `Откройте QuestFlow, чтобы посмотреть где купить!`;
            
            await sendTelegramMessage(telegramId, message);
          }
        }
      }
    } catch (error) {
      console.error(`Ошибка при проверке вишлиста для ${userDoc.id}:`, error);
    }
  }
}

async function sendTelegramMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Ошибка отправки в ТГ для ${chatId}:`, errorData);
    } else {
      console.log(`Сообщение отправлено для ${chatId}`);
    }
  } catch (error) {
    console.error(`Ошибка отправки запроса в ТГ для ${chatId}:`, error);
  }
}

checkDiscounts().then(() => console.log("Проверка завершена."));
