import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getNotificationTranslation } from '@/lib/notificationTranslations';

/**
 * PATCH /api/connections/[id]
 * Updates a connection (child can update permission)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connectionId = params.id;
    const body = await request.json();
    const { childUserId, permission, language } = body; // language: 'he' | 'en'

    if (!childUserId || typeof childUserId !== 'string') {
      return NextResponse.json(
        { error: 'Child user ID is required' },
        { status: 400 }
      );
    }

    if (!permission || !['read', 'read_write'].includes(permission)) {
      return NextResponse.json(
        { error: 'Valid permission is required (read or read_write)' },
        { status: 400 }
      );
    }

    // Verify the connection belongs to this child and get parent info
    const { data: connection, error: fetchError } = await supabase
      .from('user_connections')
      .select(`
        *,
        parent_user:users!user_connections_parent_user_id_fkey(id, firstname, lastname, phone),
        child_user:users!user_connections_child_user_id_fkey(id, firstname, lastname, phone)
      `)
      .eq('id', connectionId)
      .eq('child_user_id', childUserId)
      .eq('status', 'accepted')
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching connection:', fetchError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found or access denied' },
        { status: 404 }
      );
    }

    // Update permission
    const { error: updateError } = await supabase
      .from('user_connections')
      .update({ 
        permission,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId);

    if (updateError) {
      console.error('Error updating connection:', updateError);
      return NextResponse.json(
        { error: 'Failed to update connection' },
        { status: 500 }
      );
    }

    // Send notification to parent about permission change
    try {
      const childDisplayName = connection.child_user?.firstname && connection.child_user?.lastname
        ? `${connection.child_user.firstname} ${connection.child_user.lastname}`
        : connection.child_user?.firstname
        ? connection.child_user.firstname
        : connection.child_user?.phone || 'The user';

      // Get translated notification content
      const userLanguage = (language === 'en' || language === 'he') ? language : 'he';
      const notificationText = getNotificationTranslation({
        type: 'permission_update',
        language: userLanguage,
        childName: childDisplayName,
        permission: permission as 'read' | 'read_write',
      });

      const { data: notificationData, error: notifError } = await supabase.from('notifications').insert({
        user_id: connection.parent_user_id,
        title: notificationText.title,
        content: notificationText.content,
        type: 'permission_update',
        related_id: connectionId,
        read: false,
      }).select().single();

      if (notifError) {
        console.error('Error creating permission update notification:', {
          error: notifError,
          code: notifError.code,
          message: notifError.message,
          details: notifError.details,
          userId: connection.parent_user_id,
        });
      } else {
        console.log('Permission update notification created successfully:', notificationData?.id);
      }
    } catch (notifError) {
      console.error('Exception creating permission update notification:', notifError);
      // Don't fail the request if notification creation fails
    }

    return NextResponse.json({
      success: true,
      message: 'Connection updated successfully',
    });
  } catch (error: any) {
    console.error('Error in update connection endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/connections/[id]
 * Revokes a connection (parent or child can revoke)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connectionId = params.id;
    const body = await request.json();
    const { userId, role, language } = body; // role: 'parent' or 'child', language: 'he' | 'en'

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!role || !['parent', 'child'].includes(role)) {
      return NextResponse.json(
        { error: 'Valid role is required (parent or child)' },
        { status: 400 }
      );
    }

    // Verify the connection belongs to this user and get both user info
    const query = supabase
      .from('user_connections')
      .select(`
        *,
        parent_user:users!user_connections_parent_user_id_fkey(id, firstname, lastname, phone),
        child_user:users!user_connections_child_user_id_fkey(id, firstname, lastname, phone)
      `)
      .eq('id', connectionId);

    if (role === 'parent') {
      query.eq('parent_user_id', userId);
    } else {
      query.eq('child_user_id', userId);
    }

    const { data: connection, error: fetchError } = await query.maybeSingle();

    if (fetchError) {
      console.error('Error fetching connection:', fetchError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the connection completely
    const { error: deleteError } = await supabase
      .from('user_connections')
      .delete()
      .eq('id', connectionId);

    if (deleteError) {
      console.error('Error deleting connection:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete connection' },
        { status: 500 }
      );
    }

    // Send notification to the other user about connection being revoked
    try {
      let recipientUserId: string;
      let senderDisplayName: string;

      if (role === 'parent') {
        // Parent revoked, notify child
        recipientUserId = connection.child_user_id;
        senderDisplayName = connection.parent_user?.firstname && connection.parent_user?.lastname
          ? `${connection.parent_user.firstname} ${connection.parent_user.lastname}`
          : connection.parent_user?.firstname
          ? connection.parent_user.firstname
          : connection.parent_user?.phone || 'The user';
      } else {
        // Child revoked, notify parent
        recipientUserId = connection.parent_user_id;
        senderDisplayName = connection.child_user?.firstname && connection.child_user?.lastname
          ? `${connection.child_user.firstname} ${connection.child_user.lastname}`
          : connection.child_user?.firstname
          ? connection.child_user.firstname
          : connection.child_user?.phone || 'The user';
      }

      // Get translated notification content
      const userLanguage = (language === 'en' || language === 'he') ? language : 'he';
      const notificationText = getNotificationTranslation({
        type: 'revoked',
        language: userLanguage,
        userName: senderDisplayName,
      });

      const { data: notificationData, error: notifError } = await supabase.from('notifications').insert({
        user_id: recipientUserId,
        title: notificationText.title,
        content: notificationText.content,
        type: 'revoked',
        related_id: connectionId,
        read: false,
      }).select().single();

      if (notifError) {
        console.error('Error creating revoke notification:', {
          error: notifError,
          code: notifError.code,
          message: notifError.message,
          details: notifError.details,
          userId: recipientUserId,
          role: role,
        });
      } else {
        console.log('Revoke notification created successfully:', notificationData?.id, 'for user:', recipientUserId);
      }
    } catch (notifError) {
      console.error('Exception creating revoke notification:', notifError);
      // Don't fail the request if notification creation fails
    }

    return NextResponse.json({
      success: true,
      message: 'Connection deleted successfully',
    });
  } catch (error: any) {
    console.error('Error in revoke connection endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

