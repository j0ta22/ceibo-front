// src/types/telegram.d.ts

export {}; // Esto es importante para que TypeScript lo trate como un módulo

declare global {
  interface TelegramUser {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    allows_write_to_pm?: boolean;
    photo_url?: string;
  }

  interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
      user?: TelegramUser;
      [key: string]: any;
    };
    close: () => void;
    sendData: (data: string) => void;
    expand: () => void;
    isExpanded: boolean;
    onEvent: (eventType: string, callback: () => void) => void;
    offEvent: (eventType: string, callback: () => void) => void;
    ready: () => void;
  }

  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}
