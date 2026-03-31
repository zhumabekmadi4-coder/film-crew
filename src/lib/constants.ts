export const EQUIPMENT_CATEGORIES = [
  { value: "camera", label: "Камера" },
  { value: "lens", label: "Объектив" },
  { value: "lighting", label: "Свет" },
  { value: "audio", label: "Звук" },
  { value: "stabilizer", label: "Стабилизатор" },
  { value: "drone", label: "Дрон" },
  { value: "other", label: "Другое" },
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: "full-time", label: "Полный день" },
  { value: "part-time", label: "Частичная занятость" },
  { value: "project-based", label: "Под проект" },
] as const;

export const PROJECT_STATUSES = [
  { value: "drafting", label: "Черновик" },
  { value: "recruiting", label: "Набор команды" },
  { value: "in-progress", label: "В процессе" },
  { value: "completed", label: "Завершён" },
] as const;

export const PROJECT_TYPES = [
  { value: "technical", label: "Технический" },
  { value: "casting", label: "Кастинг" },
] as const;

export const FILM_GENRES = [
  "Короткометражный фильм",
  "Полный метр",
  "Документальный",
  "Реклама",
  "Музыкальный клип",
  "Веб-сериал",
  "Сериал",
  "Анимация",
  "Корпоративное видео",
  "Фотопроект",
  "Другое",
];

export const CONDITIONS_TYPE = {
  discuss: "discuss",
  specified: "specified",
} as const;

export const CASTING_ROLE_TYPES = [
  { value: "main", label: "Главная роль" },
  { value: "episodic", label: "Эпизодическая роль" },
  { value: "mass", label: "Массовые сцены" },
] as const;

export const GENDER_OPTIONS = [
  { value: "male", label: "Мужской" },
  { value: "female", label: "Женский" },
  { value: "other", label: "Другое" },
] as const;

export const HAIR_COLORS = [
  "Чёрный", "Тёмно-русый", "Русый", "Светло-русый",
  "Блонд", "Рыжий", "Каштановый", "Седой", "Лысый",
];

export const EYE_COLORS = [
  "Карий", "Зелёный", "Голубой", "Серый", "Чёрный", "Янтарный",
];

export const USER_ROLES = [
  { value: "user", label: "Пользователь" },
  { value: "content-manager", label: "Контент-менеджер" },
  { value: "admin", label: "Администратор" },
  { value: "superadmin", label: "Суперадминистратор" },
] as const;

export const COMPANY_STATUSES = [
  { value: "pending", label: "На рассмотрении" },
  { value: "approved", label: "Одобрена" },
  { value: "rejected", label: "Отклонена" },
] as const;

export const SERVICE_CATEGORIES = [
  { value: "rental", label: "Аренда оборудования" },
  { value: "production", label: "Продакшн" },
  { value: "post-production", label: "Пост-продакшн" },
  { value: "casting", label: "Кастинг" },
  { value: "location", label: "Локации" },
  { value: "catering", label: "Кейтеринг" },
  { value: "transport", label: "Транспорт" },
  { value: "insurance", label: "Страхование" },
  { value: "other", label: "Другое" },
] as const;
