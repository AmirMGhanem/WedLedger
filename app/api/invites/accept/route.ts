import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/invites/accept
 * Accepts an invite and creates the connection with chosen permission
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, parentUserId } = body;

    // Validate inputs
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Invite token is required' },
        { status: 400 }
      );
    }

    if (!parentUserId || typeof parentUserId !== 'string') {
      return NextResponse.json(
        { error: 'Parent user ID is required' },
        { status: 400 }
      );
    }

    // Find connection by token (parent accepts from child)
    const { data: connection, error: fetchError } = await supabase
      .from('user_connections')
      .select('*')
      .eq('invite_token', token)
      .eq('parent_user_id', parentUserId)
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
        { error: 'Invalid invite token' },
        { status: 404 }
      );
    }

    // Check if already accepted
    if (connection.status === 'accepted') {
      return NextResponse.json(
        { error: 'This invite has already been accepted' },
        { status: 400 }
      );
    }

    // Check if revoked
    if (connection.status === 'revoked') {
      return NextResponse.json(
        { error: 'This invite has been revoked' },
        { status: 400 }
      );
    }

    // Check if expired
    const expiresAt = new Date(connection.invite_expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This invite has expired' },
        { status: 400 }
      );
    }

    // Update connection to accepted (permission was already set by child when generating invite)
    const { data: updatedConnection, error: updateError } = await supabase
      .from('user_connections')
      .update({
        status: 'accepted',
        // Permission is already set by child, don't change it
      })
      .eq('id', connection.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating connection:', updateError);
      return NextResponse.json(
        { error: 'Failed to accept invite' },
        { status: 500 }
      );
    }

    // Get child user info for response
    const { data: childUser } = await supabase
      .from('users')
      .select('id, phone')
      .eq('id', connection.child_user_id)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Invite accepted successfully',
      connection: updatedConnection,
      childUser: childUser || null,
    });
  } catch (error: any) {
    console.error('Error in accept invite endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/invites/accept?token=xxx
 * Gets invite details for display before acceptance
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Invite token is required' },
        { status: 400 }
      );
    }

    // Find connection by token (parent accepts from child)
    const { data: connection, error: fetchError } = await supabase
      .from('user_connections')
      .select(`
        *,
        parent_user:users!user_connections_parent_user_id_fkey(id, phone, firstname, lastname),
        child_user:users!user_connections_child_user_id_fkey(id, phone, firstname, lastname)
      `)
      .eq('invite_token', token)
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
        { error: 'Invalid invite token' },
        { status: 404 }
      );
    }

    // Check if expired
    const expiresAt = new Date(connection.invite_expires_at);
    const isExpired = expiresAt < new Date();

    // Check status
    if (connection.status === 'revoked') {
      return NextResponse.json(
        { error: 'This invite has been revoked', connection: null },
        { status: 400 }
      );
    }

    if (connection.status === 'accepted') {
      return NextResponse.json(
        { error: 'This invite has already been accepted', connection: null },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      connection: {
        ...connection,
        isExpired,
      },
    });
  } catch (error: any) {
    console.error('Error in get invite endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

