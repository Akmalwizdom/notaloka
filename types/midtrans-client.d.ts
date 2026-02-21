declare module 'midtrans-client' {
  export class Snap {
    constructor(config: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });
    createTransaction(parameter: Record<string, unknown>): Promise<{
      token: string;
      redirect_url: string;
    }>;
    transaction: {
      notification(notificationBody: Record<string, unknown>): Promise<Record<string, unknown>>;
    };
  }
}
