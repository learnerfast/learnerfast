import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { courseId, userId, amount, courseName, websiteId } = await request.json();

    if (!courseId || !userId || !amount || !courseName) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId,
        userId,
        courseName,
        websiteId: websiteId || 'main'
      }
    };

    const order = await razorpay.orders.create(options);

    await supabase.from('payments').insert({
      order_id: order.id,
      user_id: userId,
      course_id: courseId,
      amount: amount,
      status: 'PENDING',
      payment_type: 'course',
      website_id: websiteId,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
