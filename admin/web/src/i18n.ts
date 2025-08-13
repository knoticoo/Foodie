type Lang = 'en' | 'lv' | 'ru';

let current: Lang = 'en';

const dict: Record<Lang, Record<string, string>> = {
  en: {
    adminDashboard: 'Admin Dashboard',
    auth: 'Auth',
    recipes: 'Recipes',
    comments: 'Comments',
    language: 'Language'
  },
  lv: {
    adminDashboard: 'Administrēšanas panelis',
    auth: 'Autorizācija',
    recipes: 'Receptes',
    comments: 'Komentāri',
    language: 'Valoda'
  },
  ru: {
    adminDashboard: 'Админ-панель',
    auth: 'Авторизация',
    recipes: 'Рецепты',
    comments: 'Комментарии',
    language: 'Язык'
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