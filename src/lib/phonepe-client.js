import { StandardCheckoutClient, Env } from 'pg-sdk-node';

let clientInstance = null;

export function getPhonePeClient() {
  if (!clientInstance) {
    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = process.env.PHONEPE_CLIENT_VERSION || 'v1';
    const env = process.env.PHONEPE_ENV === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

    console.log('Initializing PhonePe client with:', {
      clientId: clientId ? `${clientId.substring(0, 10)}...` : 'Missing',
      clientSecret: clientSecret ? 'Set' : 'Missing',
      clientVersion,
      env: env === Env.PRODUCTION ? 'PRODUCTION' : 'SANDBOX'
    });

    if (!clientId || !clientSecret) {
      throw new Error('PhonePe credentials are missing');
    }

    try {
      clientInstance = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
      console.log('PhonePe client instance created successfully');
    } catch (error) {
      console.error('Failed to create PhonePe client instance:', error);
      throw error;
    }
  }
  
  return clientInstance;
}
