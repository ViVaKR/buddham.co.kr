export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type SecurityLevel = 'low' | 'medium' | 'high';

export interface AppEnvironment {
  production: boolean;

  app: {
    name: string;
    origin: string;
  };

  api: {
    main: string;
    chat: string;
    suda: string;
    aiSession: string;
    runner: string;
    reply: string;
    devReply: string;
    resetPassword: string;
    devResetPassword: string;
    emailReply: string;
    clientInfo: string;
    publicIp: string;
    hubUrl: string;
  };

  features: {
    enableDebugTools: boolean;
  };

  logging: {
    level: LogLevel;
  };

  security: {
    level: SecurityLevel;
  };

  assets: {
    defaultAvatar: string;
  };
}
