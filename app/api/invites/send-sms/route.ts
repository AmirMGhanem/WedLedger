import { NextRequest, NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms';

/**
 * POST /api/invites/send-sms
 * Sends an invite link via SMS
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, inviteUrl, childPhone } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!inviteUrl || typeof inviteUrl !== 'string') {
      return NextResponse.json(
        { error: 'Invite URL is required' },
        { status: 400 }
      );
    }

    const message = `Hi! ${childPhone || 'Someone'} wants to share their WedLedger with you. Click here to accept: ${inviteUrl}`;

    const smsResult = await sendSMS({
      recipient: phone,
      message: message,
    });

    if (!smsResult.success) {
      return NextResponse.json(
        { error: smsResult.error || 'Failed to send SMS' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SMS sent successfully',
      recipients: smsResult.recipients,
    });
  } catch (error: any) {
    console.error('Error in send invite SMS endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

