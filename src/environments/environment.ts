import { AppEnvironment } from '@env/environment.model';

export const environment: AppEnvironment = {
  production: true,

  app: {
    name: 'buddham-web',
    origin: 'https://buddham.co.kr',
  },

  api: {
    main: 'https://api.buddham.co.kr',
    chat: 'https://chat.buddham.co.kr',
    suda: 'https://chat.buddham.co.kr',
    aiSession: 'https://api.buddham.co.kr/AiSession',
    runner: 'https://runner.kimbumjun.com',
    reply: 'https://buddham.co.kr',
    devReply: 'http://localhost:4200',
    resetPassword: 'https://buddham.co.kr/ResetPassword/karma',
    devResetPassword: 'http://localhost:4200/ResetPassword/karma',
    emailReply: 'https://buddham.co.kr',
    clientInfo: 'https://ns.text.or.kr',
    publicIp: 'https://ip.text.or.kr',
    hubUrl: 'https://chat.buddham.co.kr/hubs/chat',
  },

  features: {
    enableDebugTools: false,
  },

  logging: {
    level: 'error',
  },

  security: {
    level: 'high',
  },

  assets: {
    defaultAvatar: 'lotus.webp',
  },
};
