import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { randomUUID } from 'crypto';

/**
 * POST /api/invites/generate
 * Generates an invite link for linking a child user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parentUserId, childPhone } = body;

    // Validate inputs
    if (!parentUserId || typeof parentUserId !== 'string') {
      return NextResponse.json(
        { error: 'Parent user ID is required' },
        { status: 400 }
      );
    }

    if (!childPhone || typeof childPhone !== 'string') {
      return NextResponse.json(
        { error: 'Child phone number is required' },
        { status: 400 }
      );
    }

    // Clean phone number
    const cleanChildPhone = childPhone.replace(/[\s-]/g, '');

    // Check if child user exists
    const { data: childUser, error: childError } = await supabase
      .from('users')
      .select('id, phone')
      .eq('phone', cleanChildPhone)
      .maybeSingle();

    if (childError) {
      console.error('Error fetching child user:', childError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    if (!childUser) {
      return NextResponse.json(
        { error: 'User with this phone number not found' },
        { status: 404 }
      );
    }

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('user_connections')
      .select('id, status')
      .eq('parent_user_id', parentUserId)
      .eq('child_user_id', childUser.id)
      .maybeSingle();

    if (existingConnection) {
      if (existingConnection.status === 'accepted') {
        return NextResponse.json(
          { error: 'Connection already exists and is accepted' },
          { status: 400 }
        );
      }
      // If pending or revoked, we can create a new invite
    }

    // Generate unique invite token
    const inviteToken = randomUUID();

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create connection record with pending status
    const { data: connection, error: insertError } = await supabase
      .from('user_connections')
      .insert({
        parent_user_id: parentUserId,
        child_user_id: childUser.id,
        permission: 'read', // Default, will be updated when child accepts
        status: 'pending',
        invite_token: inviteToken,
        invite_expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating connection:', insertError);
      return NextResponse.json(
        { error: 'Failed to create invite' },
        { status: 500 }
      );
    }

    // Generate invite URL using BASEURL from environment
    const baseUrl = process.env.BASEURL || 
      process.env.NEXT_PUBLIC_APP_URL || 
      (request.headers.get('origin') || 'http://localhost:3000');
    const inviteUrl = `${baseUrl}/invite/${inviteToken}`;

    return NextResponse.json({
      success: true,
      inviteToken,
      inviteUrl,
      expiresAt: expiresAt.toISOString(),
      childUser: {
        id: childUser.id,
        phone: childUser.phone,
      },
    });
  } catch (error: any) {
    console.error('Error in generate invite endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

