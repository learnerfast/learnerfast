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

    if (dbError) throw dbError;

    // Create PhonePe payment request
    const client = getPhonePeClient();
    
    const metaInfo = MetaInfo.builder()
      .udf1(courseId)
      .udf2(userId)
      .udf3(courseName)
      .build();

    const payRequest = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amount * 100) // Convert to paise
      .redirectUrl(redirectUrl)
      .metaInfo(metaInfo)
      .build();

    const response = await client.pay(payRequest);

    return NextResponse.json({
      success: true,
      checkoutUrl: response.redirectUrl,
      orderId: merchantOrderId
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment initiation failed' },
      { status: 500 }
    );
  }
}
