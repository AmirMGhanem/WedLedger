import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getNotificationTranslation } from '@/lib/notificationTranslations';

/**
 * POST /api/connections/view
 * Creates a notification when parent views child's ledger
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parentUserId, childUserId, connectionId, language } = body; // language: 'he' | 'en'

    if (!parentUserId || typeof parentUserId !== 'string') {
      return NextResponse.json(
        { error: 'Parent user ID is required' },
        { status: 400 }
      );
    }

    if (!childUserId || typeof childUserId !== 'string') {
      return NextResponse.json(
        { error: 'Child user ID is required' },
        { status: 400 }
      );
    }

    // Get parent user info for notification
    const { data: parentUser } = await supabase
      .from('users')
      .select('firstname, lastname, phone')
      .eq('id', parentUserId)
      .single();

    if (!parentUser) {
      return NextResponse.json(
        { error: 'Parent user not found' },
        { status: 404 }
      );
    }

    const parentDisplayName = parentUser.firstname && parentUser.lastname
      ? `${parentUser.firstname} ${parentUser.lastname}`
      : parentUser.firstname
      ? parentUser.firstname
      : parentUser.phone || 'Someone';

    // Get translated notification content
    const userLanguage = (language === 'en' || language === 'he') ? language : 'he';
    const notificationText = getNotificationTranslation({
      type: 'viewed',
      language: userLanguage,
      parentName: parentDisplayName,
    });

    // Create notification for child
    const { data: notificationData, error: notifError } = await supabase.from('notifications').insert({
      user_id: childUserId,
      title: notificationText.title,
      content: notificationText.content,
      type: 'viewed',
      related_id: connectionId || null,
      read: false,
    }).select().single();

    if (notifError) {
      console.error('Error creating view notification:', {
        error: notifError,
        code: notifError.code,
        message: notifError.message,
        details: notifError.details,
        userId: childUserId,
      });
    } else {
      console.log('View notification created successfully:', notificationData?.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
    });
  } catch (error: any) {
    console.error('Error in view connection endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

