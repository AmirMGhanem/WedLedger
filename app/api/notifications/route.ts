import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/notifications
 * Get all notifications for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50); // Limit to last 50 notifications

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data: notifications, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching notifications:', {
        error: fetchError,
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint,
        userId: userId,
      });
      // If table doesn't exist, return empty array instead of error
      if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          notifications: [],
          unreadCount: 0,
        });
      }
      // Return detailed error for debugging
      return NextResponse.json(
        { 
          error: 'Database error occurred', 
          details: fetchError.message,
          code: fetchError.code,
          hint: fetchError.hint,
        },
        { status: 500 }
      );
    }

    console.log(`Fetched ${notifications?.length || 0} notifications for user ${userId}`);

    // Calculate unread count from the notifications array
    const unreadCount = (notifications || []).filter(n => !n.read).length;

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unreadCount: unreadCount,
    });
  } catch (error: any) {
    console.error('Error in get notifications endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, content, type, relatedId } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const validTypes = ['system', 'invite', 'connection', 'gift'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Valid type is required' },
        { status: 400 }
      );
    }

    const { data: notification, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        content,
        type,
        related_id: relatedId || null,
        read: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating notification:', insertError);
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error: any) {
    console.error('Error in create notification endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

