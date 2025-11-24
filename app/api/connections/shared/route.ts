import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/connections/shared
 * Returns list of children that the current user (parent) can access
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parentUserId = searchParams.get('parentUserId');

    if (!parentUserId || typeof parentUserId !== 'string') {
      return NextResponse.json(
        { error: 'Parent user ID is required' },
        { status: 400 }
      );
    }

    // Get all accepted connections for this parent
    const { data: connections, error: fetchError } = await supabase
      .from('user_connections')
      .select(`
        *,
        child_user:users!user_connections_child_user_id_fkey(id, phone, firstname, lastname, created_at)
      `)
      .eq('parent_user_id', parentUserId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching connections:', fetchError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      connections: connections || [],
    });
  } catch (error: any) {
    console.error('Error in get shared connections endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

