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
      throw new Error('PhonePe credentials are missing');
    }

    try {
      clientInstance = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
    } catch (error) {
      throw new Error(`PhonePe client initialization failed: ${error.message}`);
    }
  }
  
  return clientInstance;
}

export function resetPhonePeClient() {
  clientInstance = null;
}
