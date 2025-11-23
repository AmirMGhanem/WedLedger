import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * PATCH /api/user/profile
 * Updates user profile information
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, firstname, lastname, birthdate } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!firstname || typeof firstname !== 'string' || !firstname.trim()) {
      return NextResponse.json(
        { error: 'First name is required' },
        { status: 400 }
      );
    }

    if (!lastname || typeof lastname !== 'string' || !lastname.trim()) {
      return NextResponse.json(
        { error: 'Last name is required' },
        { status: 400 }
      );
    }

    if (!birthdate || typeof birthdate !== 'string') {
      return NextResponse.json(
        { error: 'Birthdate is required' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthdate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Update user profile
    const { data, error: updateError } = await supabase
      .from('users')
      .update({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        birthdate: birthdate,
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: data,
    });
  } catch (error: any) {
    console.error('Error in update profile endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

