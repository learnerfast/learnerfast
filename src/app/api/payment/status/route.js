import { NextResponse } from 'next/server';
import { getPhonePeClient } from '@/lib/phonepe-client';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantOrderId = searchParams.get('orderId');

    if (!merchantOrderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const client = getPhonePeClient();
    const response = await client.getOrderStatus(merchantOrderId);

    return NextResponse.json({
      success: true,
      orderId: response.orderId,
      state: response.state,
      amount: response.amount,
      paymentDetails: response.paymentDetails
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
