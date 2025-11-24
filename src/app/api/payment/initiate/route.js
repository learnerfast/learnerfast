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

    if (!courseId || !userId || !amount || !courseName) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required parameters',
          errorType: 'ValidationError'
        },
        { status: 400 }
      );
    }

    if (!process.env.PHONEPE_CLIENT_ID || !process.env.PHONEPE_CLIENT_SECRET) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment gateway not configured',
          errorType: 'ConfigurationError'
        },
        { status: 503 }
      );
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
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
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?orderId=${merchantOrderId}`;

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
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to create payment record',
          errorType: 'DatabaseError'
        },
        { status: 500 }
      );
    }

    let client;
    try {
      client = getPhonePeClient();
    } catch (clientError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to initialize payment gateway',
          errorType: 'PhonePeClientError'
        },
        { status: 500 }
      );
    }
    
    let metaInfo, payRequest, response;
    
    try {
      metaInfo = MetaInfo.builder()
        .udf1(String(courseId))
        .udf2(String(userId))
        .udf3(courseName)
        .build();
    } catch (metaError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to create payment metadata',
          errorType: 'MetaInfoError'
        },
        { status: 500 }
      );
    }

    try {
      payRequest = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantOrderId)
        .amount(amount * 100)
        .redirectUrl(redirectUrl)
        .metaInfo(metaInfo)
        .build();
    } catch (reqError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to create payment request',
          errorType: 'PaymentRequestError'
        },
        { status: 500 }
      );
    }

    try {
      response = await client.pay(payRequest);
    } catch (apiError) {
      console.error('PhonePe API Error:', apiError);
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

    if (!response || !response.redirectUrl) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid payment gateway response',
          errorType: 'InvalidResponseError'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: response.redirectUrl,
      orderId: merchantOrderId
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Payment initiation failed',
        errorType: 'UnknownError',
        details: error.message
      },
      { status: 500 }
    );
  }
}
