import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    const { childUserId, permission } = body;

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

    // Verify the connection belongs to this child
    const { data: connection, error: fetchError } = await supabase
      .from('user_connections')
      .select('*')
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
    const { userId, role } = body; // role: 'parent' or 'child'

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

    // Verify the connection belongs to this user
    const query = supabase
      .from('user_connections')
      .select('*')
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

    // Update status to revoked instead of deleting (for audit trail)
    const { error: updateError } = await supabase
      .from('user_connections')
      .update({ status: 'revoked' })
      .eq('id', connectionId);

    if (updateError) {
      console.error('Error revoking connection:', updateError);
      return NextResponse.json(
        { error: 'Failed to revoke connection' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Connection revoked successfully',
    });
  } catch (error: any) {
    console.error('Error in revoke connection endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

