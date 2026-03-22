# 🛍️ TechTGShop - Telegram Bot Shop

Полнофункциональный Telegram бот-магазин с веб панелью администратора, поддержкой плагинов и Docker контейнеризацией.

## 🚀 Возможности

### 🤖 Telegram Bot
- **Интерактивная витрина** товаров
- **Управление корзиной** в реальном времени
- **Оформление заказов** с отслеживанием статуса
- **FSM состояния** для управления пользовательским опытом
- **Поддержка плагинов** для расширения функционала

### 🌐 Веб-панель администратора
- **MVC архитектура** с Flask Blueprint
- **Управление товарами** и категориями
- **Обработка заказов** и управление статусами
- **Управление плагинами** через веб-интерфейс
- **Аутентификация** и безопасность

### 💳 Платежная система
- **Отдельный webhook сервер** для обработки платежей
- **Поддержка YooKassa** и Stripe
- **Безопасная обработка** вебхуков
- **Автоматическое обновление** статусов заказов

### 🔌 Система плагинов
- **Универсальные плагины** для бота и веб-панели
- **Базовый класс** для легкой разработки
- **Автоматическая регистрация** хуков
- **Пример плагина** для старта

### 🐳 Docker поддержка
- **Мульти-контейнерная** архитектура
- **PostgreSQL** и Redis в контейнерах
- **Отдельные сервисы** для масштабирования
- **docker-compose** для легкого развертывания

## 📁 Структура проекта

```
techTgshop/
├── bot/                    # Telegram бот
│   ├── handlers/          # Обработчики команд
│   ├── states/            # FSM состояния
│   ├── keyboards/         # Клавиатуры
│   ├── utils/             # Утилиты
│   └── plugin_hooks/      # Точки входа для плагинов
├── web/                   # Flask админ-панель
│   ├── controllers/       # Контроллеры с блюринтами
│   ├── models/            # Модели
│   ├── templates/         # Шаблоны
│   ├── static/           # Статика
│   └── plugin_hooks/      # Точки входа для плагинов
├── webhook_server/        # Вебхуки для платежей
├── plugins/               # Универсальные плагины
├── shared/                # Общие модели и утилиты
├── docker/               # Docker конфигурации
└── config/               # Конфигурации
```

## 🛠️ Установка и запуск

### Требования
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd techTgshop
```

### 2. Настройка окружения
```bash
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
```

### 3. Запуск с Docker Compose (рекомендуется)
```bash
docker-compose up -d
```

### 4. Ручной запуск
```bash
# Установка зависимостей
pip install -r requirements.txt

# Настройка базы данных
python run.py

# Запуск сервисов
python bot/main.py              # Telegram бот
python web/app.py               # Веб-панель
python webhook_server/app.py    # Webhook сервер
```

### Миграции базы данных (Aerich)
```bash
# Инициализация (первый раз)
aerich init -t shared.database.models.TORTOISE_ORM

# Создание миграции
aerich migrate -n "description"

# Применение миграций
aerich upgrade
```

## 🔧 Конфигурация

### Основные переменные окружения
```env
# Telegram Bot
BOT_TOKEN=your_telegram_bot_token

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tech_tgshop

# Redis
REDIS_URL=redis://localhost:6379/0

# Web Admin Panel
WEB_SECRET_KEY=your_secret_key

# Payment Systems
YOOKASSA_SHOP_ID=your_yookassa_shop_id
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## 📚 Документация

### Разработка плагинов
1. Создайте директорию в `plugins/`
2. Наследуйтесь от `BasePlugin` в `plugins/base_plugin.py`
3. Реализуйте необходимые методы:
   - `get_bot_handlers()` - обработчики для бота
   - `get_web_routes()` - роуты для веб-панели
   - `get_models()` - модели базы данных

### API Endpoints
- `GET /` - Главная админ-панели
- `POST /webhook/yookassa` - YooKassa вебхук
- `POST /webhook/stripe` - Stripe вебхук

## 🤝 Contributing

1. Fork проекта
2. Создайте feature branch
3. Commit изменения
4. Push в branch
5. Создайте Pull Request

## 📄 Лицензия

MIT License

## 🆘 Поддержка

Если у вас есть вопросы или проблемы:
- Создайте Issue в GitHub
- Проверьте документацию
- Посмотрите пример плагина

---

**TechTGShop** - современное решение для создания Telegram магазинов! 🚀
