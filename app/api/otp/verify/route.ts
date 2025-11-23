import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/otp/verify
 * Verifies the OTP code for the provided phone number
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, otp } = body;

        // Validate inputs
        if (!phone || typeof phone !== 'string') {
            return NextResponse.json(
                { error: 'Phone number is required' },
                { status: 400 }
            );
        }

        if (!otp || typeof otp !== 'string') {
            return NextResponse.json(
                { error: 'OTP code is required' },
                { status: 400 }
            );
        }

        // Clean phone number
        const cleanPhone = phone.replace(/[\s-]/g, '');
        const cleanOtp = otp.trim();

        // Fetch user with stored OTP
        const { data: dbUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('phone', cleanPhone)
            .maybeSingle();

        if (fetchError) {
            console.error('Error fetching user:', fetchError);
            return NextResponse.json(
                { error: 'Database error occurred' },
                { status: 500 }
            );
        }

        if (!dbUser) {
            return NextResponse.json(
                { error: 'User not found. Please request OTP first.' },
                { status: 404 }
            );
        }

        // Verify OTP matches
        if (dbUser.otp_code !== cleanOtp) {
            return NextResponse.json(
                { error: 'Invalid OTP. Please check the code and try again.' },
                { status: 401 }
            );
        }

        // Optional: Check OTP expiration (if you add otp_expires_at field)
        // if (dbUser.otp_expires_at && new Date(dbUser.otp_expires_at) < new Date()) {
        //   return NextResponse.json(
        //     { error: 'OTP has expired. Please request a new code.' },
        //     { status: 401 }
        //   );
        // }

        // Clear OTP after successful verification (security best practice)
        await supabase
            .from('users')
            .update({ otp_code: null })
            .eq('id', dbUser.id);

        // Load user's related data for response
        const [familyResult, giftsResult] = await Promise.all([
            supabase
                .from('family_members')
                .select('*')
                .eq('user_id', dbUser.id),
            supabase
                .from('gifts')
                .select('*')
                .eq('user_id', dbUser.id)
        ]);

        return NextResponse.json({
            success: true,
            message: 'OTP verified successfully',
            user: {
                id: dbUser.id,
                phone: dbUser.phone,
                familyCount: familyResult.data?.length || 0,
                giftsCount: giftsResult.data?.length || 0,
            },
        });
    } catch (error: any) {
        console.error('Error in verify OTP endpoint:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

