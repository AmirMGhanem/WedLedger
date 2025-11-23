import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendOTP } from '@/lib/sms';

/**
 * POST /api/otp/send
 * Sends an OTP code to the provided phone number via SMS
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone } = body;

        // Validate phone number
        if (!phone || typeof phone !== 'string') {
            return NextResponse.json(
                { error: 'Phone number is required' },
                { status: 400 }
            );
        }

        // Clean phone number
        const cleanPhone = phone.replace(/[\s-]/g, '');

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('phone', cleanPhone)
            .maybeSingle();

        if (fetchError) {
            console.error('Error fetching user:', fetchError);
            return NextResponse.json(
                { error: 'Database error occurred' },
                { status: 500 }
            );
        }

        // Update or create user with OTP
        if (existingUser) {
            // Update existing user with new OTP
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    otp_code: otpCode,
                    // Optionally store OTP expiration time (10 minutes from now)
                    // otp_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
                })
                .eq('phone', cleanPhone);

            if (updateError) {
                console.error('Error updating OTP:', updateError);
                return NextResponse.json(
                    { error: 'Failed to generate OTP' },
                    { status: 500 }
                );
            }
        } else {
            // Generate user ID (consistent with AuthContext logic)
            const generateUserId = (phone: string): string => {
                let hash = 0;
                for (let i = 0; i < phone.length; i++) {
                    hash = ((hash << 5) - hash) + phone.charCodeAt(i);
                    hash = hash & hash;
                }
                const hex = Math.abs(hash).toString(16).padStart(32, '0');
                return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-4${hex.substring(12, 15)}-a${hex.substring(15, 18)}-${hex.substring(18, 30)}`;
            };

            const userId = generateUserId(cleanPhone);
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    id: userId,
                    phone: cleanPhone,
                    otp_code: otpCode,
                });

            if (insertError) {
                console.error('Error creating user:', insertError);
                return NextResponse.json(
                    { error: 'Failed to create user account' },
                    { status: 500 }
                );
            }
        }

        // Send OTP via SMS
        const smsResult = await sendOTP(cleanPhone, otpCode);

        if (!smsResult.success) {
            console.error('SMS sending failed:', smsResult.error);
            // Still return success to user, but log the error
            // In production, you might want to handle this differently
            return NextResponse.json(
                {
                    error: 'Failed to send SMS. Please try again later.',
                    details: smsResult.error
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully',
            recipients: smsResult.recipients,
        });
    } catch (error: any) {
        console.error('Error in send OTP endpoint:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

