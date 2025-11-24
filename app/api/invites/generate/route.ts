import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { randomUUID } from 'crypto';
import { getNotificationTranslation } from '@/lib/notificationTranslations';

/**
 * POST /api/invites/generate
 * Generates an invite link for sharing ledger (child shares with parent)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { childUserId, parentPhone, permission, language } = body; // language: 'he' | 'en'

    // Validate inputs
    if (!childUserId || typeof childUserId !== 'string') {
      return NextResponse.json(
        { error: 'Child user ID is required' },
        { status: 400 }
      );
    }

    if (!parentPhone || typeof parentPhone !== 'string') {
      return NextResponse.json(
        { error: 'Parent phone number is required' },
        { status: 400 }
      );
    }

    if (!permission || !['read', 'read_write'].includes(permission)) {
      return NextResponse.json(
        { error: 'Valid permission (read or read_write) is required' },
        { status: 400 }
      );
    }

    // Clean phone number
    const cleanParentPhone = parentPhone.replace(/[\s-]/g, '');

    // Check if parent user exists
    const { data: parentUser, error: parentError } = await supabase
      .from('users')
      .select('id, phone')
      .eq('phone', cleanParentPhone)
      .maybeSingle();

    if (parentError) {
      console.error('Error fetching parent user:', parentError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    if (!parentUser) {
      return NextResponse.json(
        { error: 'User with this phone number not found' },
        { status: 404 }
      );
    }

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('user_connections')
      .select('id, status')
      .eq('parent_user_id', parentUser.id)
      .eq('child_user_id', childUserId)
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
    // Permission is set by child when generating invite
    const { data: connection, error: insertError } = await supabase
      .from('user_connections')
      .insert({
        parent_user_id: parentUser.id,
        child_user_id: childUserId,
        permission: permission, // Set by child
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

    // Create notification for the parent user
    try {
      // Get child user info for notification
      const { data: childUser } = await supabase
        .from('users')
        .select('firstname, lastname, phone')
        .eq('id', childUserId)
        .single();

      const childDisplayName = childUser?.firstname && childUser?.lastname
        ? `${childUser.firstname} ${childUser.lastname}`
        : childUser?.firstname
        ? childUser.firstname
        : childUser?.phone || 'Someone';

      // Get translated notification content
      const userLanguage = (language === 'en' || language === 'he') ? language : 'he';
      const notificationText = getNotificationTranslation({
        type: 'invite',
        language: userLanguage,
        childName: childDisplayName,
        permission: permission as 'read' | 'read_write',
      });

      const { data: notificationData, error: notifError } = await supabase.from('notifications').insert({
        user_id: parentUser.id,
        title: notificationText.title,
        content: notificationText.content,
        type: 'invite',
        related_id: connection.id, // Use connection ID instead of token
        read: false,
      }).select().single();

      if (notifError) {
        console.error('Error creating invite notification:', {
          error: notifError,
          code: notifError.code,
          message: notifError.message,
          details: notifError.details,
          userId: parentUser.id,
        });
      } else {
        console.log('Invite notification created successfully:', notificationData?.id);
      }
    } catch (notifError) {
      console.error('Exception creating invite notification:', notifError);
      // Don't fail the request if notification creation fails
    }

    return NextResponse.json({
      success: true,
      inviteToken,
      inviteUrl,
      expiresAt: expiresAt.toISOString(),
      parentUser: {
        id: parentUser.id,
        phone: parentUser.phone,
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

