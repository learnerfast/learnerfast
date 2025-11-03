import { NextResponse } from 'next/server';
import { getPhonePeClient } from '@/lib/phonepe-client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const authorization = request.headers.get('authorization');
    const body = await request.text();

    const client = getPhonePeClient();
    
    const callbackResponse = client.validateCallback(
      process.env.PHONEPE_CALLBACK_USERNAME,
      process.env.PHONEPE_CALLBACK_PASSWORD,
      authorization,
      body
    );

    const { orderId, state, amount, paymentDetails } = callbackResponse.payload;

    // Update payment status in database
    await supabase
      .from('payments')
      .update({
        status: state,
        transaction_id: paymentDetails?.[0]?.transactionId,
        payment_mode: paymentDetails?.[0]?.paymentMode,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId);

    // If payment successful, create enrollment
    if (state === 'COMPLETED') {
      const { data: payment } = await supabase
        .from('payments')
        .select('user_id, course_id')
        .eq('order_id', orderId)
        .single();

      if (payment) {
        await supabase
          .from('enrollments')
          .insert({
            user_id: payment.user_id,
            course_id: payment.course_id,
            enrolled_at: new Date().toISOString()
          });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
