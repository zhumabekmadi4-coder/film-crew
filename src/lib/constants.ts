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
