# Karma Tracker Mobile App

Мобильное приложение для отслеживания кармы на React Native (Expo).

## 🚀 Быстрый старт

### Требования

- Node.js 18+
- npm или yarn
- Expo Go приложение на телефоне (для тестирования)

### Установка

1. Установите зависимости:

```bash
yarn
```

1. Создайте файл `.env` из `.env.example`:

```bash
cp .env.example .env
```

1. Отредактируйте `.env` файл и добавьте URL вашего API и Google Client ID:

```
API_BASE_URL=https://your-api-url.com/api
GOOGLE_CLIENT_ID=your-google-client-id-here
```

### Запуск приложения

```bash
# Запустить dev сервер
yarn dev

# Запустить на Android
yarn android

# Запустить на iOS
yarn ios

# Запустить в браузере (web)
yarn run web
```

### Сканирование QR кода

После запуска `yarn dev`, откройте приложение Expo Go на телефоне и отсканируйте QR код из терминала.

## 📱 Функциональность

### Авторизация

- Вход по логину и паролю
- Регистрация
- Вход через Google OAuth

### Экраны

1. **Чат** - общение с карма-ботом
  - Отправка текстовых сообщений
  - История действий
  - Получение оценки кармы
2. **Карма** - главный экран статистики
  - Большой индикатор кармы
  - Уровень пользователя
  - Прогресс дневной цели
  - Статистика добрых/плохих дел
  - Карма за неделю
  - Последние действия
3. **Настройки**
  - Выбор страны
  - Личность бота (нейтральный, вдохновляющий, строгий)
  - Дневная цель кармы
  - Включение/выключение напоминаний
  - Выход из аккаунта

## 🎨 Дизайн

### Цвета

- Primary: `#2D6A4F`
- Secondary: `#52B788`
- Tertiary: `#1B4332`
- Neutral: `#F8FAF9`

### Шрифт

- Manrope (требует установки шрифта)

## 🔌 API Endpoints

Приложение взаимодействует с backend через следующие endpoints:

1. `POST /login` - вход
2. `POST /signUp` - регистрация
3. `POST /loginWithGoogle` - вход через Google
4. `GET /getUser` - получить данные пользователя
5. `PATCH /updateUser` - обновить данные пользователя
6. `GET /getUserKarma` - получить историю кармы
7. `POST /getKarma` - отправить действие и получить карму

Все запросы (кроме авторизации) требуют header:

```
Authorization: Bearer {accessToken}
```

## 📦 Структура проекта

```
react-native-karma/
├── App.tsx                    # Точка входа
├── src/
│   ├── constants/
│   │   └── colors.ts         # Цветовая палитра
│   ├── contexts/
│   │   └── AuthContext.tsx   # Контекст авторизации
│   ├── navigation/
│   │   └── AppNavigator.tsx  # Навигация приложения
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── KarmaScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/
│   │   └── api.ts            # API сервис
│   └── types/
│       └── index.ts          # TypeScript типы
├── app.json                  # Expo конфигурация
├── package.json
└── tsconfig.json
```

## 🔧 Настройка Google OAuth

1. Создайте проект в [Google Cloud Console](https://console.cloud.google.com/)
2. Включите Google+ API
3. Создайте OAuth 2.0 Client ID
4. Добавьте Client ID в `.env` файл
5. Для Android добавьте SHA-1 fingerprint в настройках OAuth

## 📝 Заметки

- Все данные пользователя хранятся на сервере
- Access token сохраняется в AsyncStorage
- При ошибке 401 (Unauthorized) пользователь автоматически перенаправляется на экран входа
- Приложение обновляет данные кармы каждые 5 секунд на экране Карма

## 🛠 Разработка

### Добавление новых экранов

1. Создайте компонент в `src/screens/`
2. Добавьте типы в `src/types/index.ts`
3. Зарегистрируйте экран в `src/navigation/AppNavigator.tsx`

### Добавление API методов

Добавьте новые методы в `src/services/api.ts`

## 📄 Лицензия

MIT
