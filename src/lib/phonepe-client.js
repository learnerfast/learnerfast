import { StandardCheckoutClient, Env } from 'pg-sdk-node';

let clientInstance = null;

export function getPhonePeClient() {
  if (!clientInstance) {
    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '1';
    const envString = (process.env.PHONEPE_ENV || 'SANDBOX').toUpperCase();
    const env = envString === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

    if (!clientId || !clientSecret) {
      console.error('PhonePe credentials missing:', { clientId: !!clientId, clientSecret: !!clientSecret });
      throw new Error('PhonePe credentials are missing');
    }

    console.log('Initializing PhonePe client:', { clientId, env: envString, version: clientVersion });

    try {
      clientInstance = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
      console.log('PhonePe client initialized successfully');
    } catch (error) {
      console.error('PhonePe client initialization error:', error);
      throw new Error(`PhonePe client initialization failed: ${error.message}`);
    }
  }
  
  return clientInstance;
}

export function resetPhonePeClient() {
  clientInstance = null;
}
