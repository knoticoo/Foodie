type Lang = 'en' | 'lv' | 'ru';

let current: Lang = 'en';

const dict: Record<Lang, Record<string, string>> = {
  en: {
    adminDashboard: 'Admin Dashboard',
    auth: 'Auth',
    recipes: 'Recipes',
    weeklyPlanner: 'Weekly Planner',
    preferences: 'Preferences',
    recommendations: 'Recommendations',
    submitRecipe: 'Submit Recipe',
    uploadImage: 'Upload Image (base64)',
    ratings: 'Ratings',
    comments: 'Comments',
    approvals: 'Admin: Approvals',
    challenges: 'Admin: Challenges',
    monetization: 'Admin: Monetization',
    recipeCrud: 'Admin: Recipe CRUD',
    language: 'Language',
    load: 'Load',
    save: 'Save',
    create: 'Create',
    update: 'Update',
    delete: 'Delete'
  },
  lv: {
    adminDashboard: 'Administrēšanas panelis',
    auth: 'Autorizācija',
    recipes: 'Receptes',
    weeklyPlanner: 'Nedēļas plānotājs',
    preferences: 'Iestatījumi',
    recommendations: 'Ieteikumi',
    submitRecipe: 'Iesniegt recepti',
    uploadImage: 'Augšupielādēt attēlu (base64)',
    ratings: 'Vērtējumi',
    comments: 'Komentāri',
    approvals: 'Admins: Apstiprinājumi',
    challenges: 'Admins: Izaicinājumi',
    monetization: 'Admins: Monetizācija',
    recipeCrud: 'Admins: Receptes CRUD',
    language: 'Valoda',
    load: 'Ielādēt',
    save: 'Saglabāt',
    create: 'Izveidot',
    update: 'Atjaunināt',
    delete: 'Dzēst'
  },
  ru: {
    adminDashboard: 'Админ-панель',
    auth: 'Авторизация',
    recipes: 'Рецепты',
    weeklyPlanner: 'Планировщик недели',
    preferences: 'Настройки',
    recommendations: 'Рекомендации',
    submitRecipe: 'Отправить рецепт',
    uploadImage: 'Загрузка изображения (base64)',
    ratings: 'Оценки',
    comments: 'Комментарии',
    approvals: 'Админ: Одобрения',
    challenges: 'Админ: Челленджи',
    monetization: 'Админ: Монетизация',
    recipeCrud: 'Админ: Рецепты CRUD',
    language: 'Язык',
    load: 'Загрузить',
    save: 'Сохранить',
    create: 'Создать',
    update: 'Обновить',
    delete: 'Удалить'
  }
};

export function setLang(lang: Lang) {
  current = lang;
}

export function getLang(): Lang {
  return current;
}

export function t(key: string): string {
  return dict[current][key] || dict.en[key] || key;
}