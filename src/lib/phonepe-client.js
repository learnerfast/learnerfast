import { StandardCheckoutClient, Env } from 'pg-sdk-node';

let clientInstance = null;

export function getPhonePeClient() {
  if (!clientInstance) {
    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = process.env.PHONEPE_CLIENT_VERSION || 'v1';
    const env = process.env.PHONEPE_ENV === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

    clientInstance = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
  }
  
  return clientInstance;
}
