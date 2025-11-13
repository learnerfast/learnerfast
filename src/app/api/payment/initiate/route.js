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

    console.log('=== Payment Initiation Started ===');
    console.log('Request data:', { courseId, userId, amount, courseName });
    console.log('Environment check:', {
      clientId: process.env.PHONEPE_CLIENT_ID ? 'Set' : 'Missing',
      clientSecret: process.env.PHONEPE_CLIENT_SECRET ? 'Set' : 'Missing',
      env: process.env.PHONEPE_ENV,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'
    });

    // Validate required parameters
    if (!courseId || !userId || !amount || !courseName) {
      console.error('Missing required parameters');
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required parameters',
          errorType: 'ValidationError'
        },
        { status: 400 }
      );
    }

    // Check PhonePe credentials
    if (!process.env.PHONEPE_CLIENT_ID || !process.env.PHONEPE_CLIENT_SECRET) {
      console.error('PhonePe credentials missing');
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment gateway not configured. Please contact support.',
          errorType: 'ConfigurationError'
        },
        { status: 503 }
      );
    }

    // Check app URL
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('NEXT_PUBLIC_APP_URL not configured');
      return NextResponse.json(
        { 
          success: false,
          error: 'Application URL not configured',
          errorType: 'ConfigurationError'
        },
        { status: 503 }
      );
    }

    const merchantOrderId = `ORDER_${Date.now()}_${userId}`;
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`;
    console.log('Order ID:', merchantOrderId);
    console.log('Redirect URL:', redirectUrl);

    // Save payment record
    console.log('Saving payment record to database...');
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
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to create payment record',
          errorType: 'DatabaseError',
          details: dbError.message
        },
        { status: 500 }
      );
    }
    console.log('Payment record saved successfully');

    // Initialize PhonePe client
    console.log('Initializing PhonePe client...');
    let client;
    try {
      client = getPhonePeClient();
      console.log('PhonePe client initialized successfully');
    } catch (clientError) {
      console.error('PhonePe client initialization error:', clientError);
      console.error('Client error stack:', clientError.stack);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to initialize payment gateway',
          errorType: 'PhonePeClientError',
          details: clientError.message
        },
        { status: 500 }
      );
    }
    
    // Build payment request
    console.log('Building payment request...');
    let metaInfo, payRequest, response;
    
    try {
      metaInfo = MetaInfo.builder()
        .udf1(String(courseId))
        .udf2(String(userId))
        .udf3(courseName)
        .build();
      console.log('MetaInfo created successfully');
    } catch (metaError) {
      console.error('MetaInfo creation error:', metaError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to create payment metadata',
          errorType: 'MetaInfoError',
          details: metaError.message
        },
        { status: 500 }
      );
    }

    try {
      payRequest = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantOrderId)
        .amount(amount * 100) // Convert to paise
        .redirectUrl(redirectUrl)
        .metaInfo(metaInfo)
        .build();
      console.log('Payment request created:', {
        merchantOrderId,
        amount: amount * 100,
        redirectUrl
      });
    } catch (reqError) {
      console.error('Payment request creation error:', reqError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to create payment request',
          errorType: 'PaymentRequestError',
          details: reqError.message
        },
        { status: 500 }
      );
    }

    // Call PhonePe API
    console.log('Calling PhonePe API...');
    try {
      response = await client.pay(payRequest);
      console.log('PhonePe API response:', JSON.stringify(response, null, 2));
    } catch (apiError) {
      console.error('PhonePe API call error:', apiError);
      console.error('API error details:', {
        message: apiError.message,
        stack: apiError.stack,
        name: apiError.name
      });
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment gateway API error',
          errorType: 'PhonePeAPIError',
          details: apiError.message
        },
        { status: 500 }
      );
    }

    // Validate response
    if (!response || !response.redirectUrl) {
      console.error('Invalid PhonePe response:', response);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid payment gateway response',
          errorType: 'InvalidResponseError'
        },
        { status: 500 }
      );
    }

    console.log('=== Payment Initiation Successful ===');
    return NextResponse.json({
      success: true,
      checkoutUrl: response.redirectUrl,
      orderId: merchantOrderId
    });

  } catch (error) {
    console.error('=== Payment Initiation Failed ===');
    console.error('Unexpected error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Payment initiation failed',
        errorType: error.name || 'UnknownError',
        details: error.stack
      },
      { status: 500 }
    );
  }
}
