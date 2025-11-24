import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * PATCH /api/future-events/[id]
 * Update a future event
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await request.json();
    const { userId, name, eventType, date, notes } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify the event belongs to this user
    const { data: existingEvent, error: fetchError } = await supabase
      .from('future_events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching event:', fetchError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 404 }
      );
    }

    // Validate inputs
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Event name cannot be empty' },
        { status: 400 }
      );
    }

    if (date !== undefined) {
      if (typeof date !== 'string') {
        return NextResponse.json(
          { error: 'Event date must be a string' },
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
    }

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (eventType !== undefined) updateData.event_type = eventType?.trim() || null;
    if (date !== undefined) updateData.date = date;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;

    const { data: updatedEvent, error: updateError } = await supabase
      .from('future_events')
      .update(updateData)
      .eq('id', eventId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating event:', updateError);
      return NextResponse.json(
        { error: 'Failed to update event', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent,
    });
  } catch (error: any) {
    console.error('Error in update future event endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/future-events/[id]
 * Delete a future event
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify the event belongs to this user
    const { data: existingEvent, error: fetchError } = await supabase
      .from('future_events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching event:', fetchError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from('future_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting event:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete event', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error: any) {
    console.error('Error in delete future event endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

