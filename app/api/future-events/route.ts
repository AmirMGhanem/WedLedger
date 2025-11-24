import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/future-events
 * Get all future events for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: events, error: fetchError } = await supabase
      .from('future_events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true }); // Order by date ascending (upcoming first)

    if (fetchError) {
      console.error('Error fetching future events:', {
        error: fetchError,
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details,
        userId: userId,
      });
      // If table doesn't exist, return empty array instead of error
      if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          events: [],
        });
      }
      return NextResponse.json(
        { error: 'Database error occurred', details: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      events: events || [],
    });
  } catch (error: any) {
    console.error('Error in get future events endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/future-events
 * Create a new future event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, eventType, date, notes } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    if (!date || typeof date !== 'string') {
      return NextResponse.json(
        { error: 'Event date is required' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const { data: event, error: insertError } = await supabase
      .from('future_events')
      .insert({
        user_id: userId,
        name: name.trim(),
        event_type: eventType?.trim() || null,
        date: date,
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating future event:', insertError);
      return NextResponse.json(
        { error: 'Failed to create future event', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error: any) {
    console.error('Error in create future event endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

