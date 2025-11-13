import { NextResponse } from 'next/server';
import { getPhonePeClient } from '@/lib/phonepe-client';
import { StandardCheckoutPayRequest, MetaInfo } from 'pg-sdk-node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { courseId, userId, amount, courseName } = await request.json();

    console.log('Payment initiation request:', { courseId, userId, amount, courseName });
    console.log('PhonePe config:', {
      clientId: process.env.PHONEPE_CLIENT_ID ? 'Set' : 'Missing',
      clientSecret: process.env.PHONEPE_CLIENT_SECRET ? 'Set' : 'Missing',
      env: process.env.PHONEPE_ENV
    });

    if (!process.env.PHONEPE_CLIENT_ID || !process.env.PHONEPE_CLIENT_SECRET) {
      console.error('PhonePe credentials missing');
      return NextResponse.json(
        { error: 'Payment gateway not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const merchantOrderId = `ORDER_${Date.now()}_${userId}`;
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`;

    // Save payment record
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        order_id: merchantOrderId,
        user_id: userId,
        course_id: courseId,
        amount: amount,
        status: 'PENDING',
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Payment record saved, initializing PhonePe client...');

    // Create PhonePe payment request
    let client;
    try {
      client = getPhonePeClient();
      console.log('PhonePe client initialized');
    } catch (clientError) {
      console.error('PhonePe client initialization error:', clientError);
      throw new Error('Failed to initialize payment gateway: ' + clientError.message);
    }
    
    console.log('Building payment request...');
    const metaInfo = MetaInfo.builder()
      .udf1(String(courseId))
      .udf2(String(userId))
      .udf3(courseName)
      .build();

    const payRequest = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amount * 100) // Convert to paise
      .redirectUrl(redirectUrl)
      .metaInfo(metaInfo)
      .build();

    console.log('Calling PhonePe API...');
    const response = await client.pay(payRequest);
    console.log('PhonePe response:', response);

    return NextResponse.json({
      success: true,
      checkoutUrl: response.redirectUrl,
      orderId: merchantOrderId
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Payment initiation failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
