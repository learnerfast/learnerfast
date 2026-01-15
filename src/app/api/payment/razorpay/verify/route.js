import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      const { data: payment } = await supabase
        .from('payments')
        .select('user_id, course_id')
        .eq('order_id', razorpay_order_id)
        .single();

      await supabase.from('payments').update({
        status: 'COMPLETED',
        transaction_id: razorpay_payment_id,
        updated_at: new Date().toISOString()
      }).eq('order_id', razorpay_order_id);

      if (payment) {
        await supabase.from('enrollments').insert({
          user_id: payment.user_id,
          course_id: payment.course_id,
          enrolled_at: new Date().toISOString()
        });
      }

      return NextResponse.json({ success: true, message: 'Payment verified' });
    }

    return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
