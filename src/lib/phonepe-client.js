import { StandardCheckoutClient, Env } from 'pg-sdk-node';

let clientInstance = null;

export function getPhonePeClient() {
  if (!clientInstance) {
    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '1';
    const envString = (process.env.PHONEPE_ENV || 'SANDBOX').toUpperCase();
    const env = envString === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

    console.log('=== PhonePe Client Initialization ===');
    console.log('Config:', {
      clientId: clientId ? `${clientId.substring(0, 10)}...` : 'Missing',
      clientSecret: clientSecret ? `${clientSecret.substring(0, 8)}...` : 'Missing',
      clientVersion,
      envString,
      env: env === Env.PRODUCTION ? 'PRODUCTION' : 'SANDBOX'
    });

    if (!clientId || !clientSecret) {
      const error = new Error('PhonePe credentials are missing. Please configure PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET in environment variables.');
      console.error('Credentials missing:', {
        clientId: !!clientId,
        clientSecret: !!clientSecret
      });
      throw error;
    }

    try {
      console.log('Calling StandardCheckoutClient.getInstance...');
      clientInstance = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
      console.log('PhonePe client instance created successfully');
      console.log('Client instance type:', typeof clientInstance);
    } catch (error) {
      console.error('=== PhonePe Client Initialization Failed ===');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw new Error(`PhonePe client initialization failed: ${error.message}`);
    }
  }
  
  return clientInstance;
}

export function resetPhonePeClient() {
  clientInstance = null;
}
