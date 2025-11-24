import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/connections/my-connections
 * Returns list of connections where the current user is the child (who can see my data)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const childUserId = searchParams.get('childUserId');

        if (!childUserId || typeof childUserId !== 'string') {
            return NextResponse.json(
                { error: 'Child user ID is required' },
                { status: 400 }
            );
        }

        // Get all connections where this user is the child (all statuses)
        const { data: connections, error: fetchError } = await supabase
            .from('user_connections')
            .select(`
        *,
        parent_user:users!user_connections_parent_user_id_fkey(id, phone, firstname, lastname, created_at)
      `)
            .eq('child_user_id', childUserId)
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
        console.error('Error in get my connections endpoint:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

