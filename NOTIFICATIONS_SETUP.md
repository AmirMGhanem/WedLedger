# Notifications System - Setup Guide

## Database Migration Required

You need to run the following migration file to create the notifications table:

**File:** `supabase/migrations/create_notifications_table.sql`

### What it creates:

1. **`notifications` table** with the following structure:
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key to users table)
   - `title` (TEXT, required)
   - `content` (TEXT, required)
   - `type` (TEXT, enum: 'system', 'invite', 'connection', 'gift')
   - `related_id` (UUID, optional - for linking to invites, connections, etc.)
   - `read` (BOOLEAN, default: false)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **Indexes** for performance:
   - Index on `user_id`
   - Index on `(user_id, read)` for quick unread queries
   - Index on `created_at` for sorting
   - Index on `type` for filtering

3. **Row Level Security (RLS) Policies**:
   - Users can only view their own notifications
   - Users can update their own notifications (mark as read)
   - System can insert notifications for any user

4. **Trigger** to automatically update `updated_at` timestamp

### To apply the migration:

Run the SQL file in your Supabase SQL editor or via migration tool.

## Features Implemented

### 1. **Notification Bell Icon in AppBar**
   - Badge showing unread count
   - Tooltip on hover
   - Click to open notifications dropdown

### 2. **Notifications Dropdown**
   - Shows last 50 notifications
   - Unread notifications highlighted with blue background
   - Click notification to mark as read and navigate
   - Refresh button with loading state
   - Empty state when no notifications
   - "View All" button (ready for future full page)

### 3. **Short Polling**
   - Automatically refreshes notifications every 30 seconds
   - Polling stops when component unmounts
   - Manual refresh available via button

### 4. **Invite Notifications**
   - When a child generates an invite, a notification is automatically created for the parent
   - Notification includes child's name
   - Clicking notification navigates to invite acceptance page
   - SMS button is hidden (code kept for future use)

### 5. **API Endpoints**

#### GET `/api/notifications?userId={id}&unreadOnly=true`
- Get all notifications for a user
- Optional `unreadOnly` parameter
- Returns notifications and unread count

#### POST `/api/notifications`
- Create a new notification
- Body: `{ userId, title, content, type, relatedId? }`

#### PATCH `/api/notifications/[id]`
- Mark notification as read/unread
- Body: `{ userId, read: boolean }`

#### DELETE `/api/notifications/[id]?userId={id}`
- Delete a notification

## UI/UX Design

- **Modern, clean design** with Material-UI components
- **Visual indicators**: Unread notifications have blue background
- **Time ago formatting**: Shows "2 hours ago", "3 days ago", etc.
- **Type badges**: Invite notifications show a badge
- **Smooth animations**: Hover effects and transitions
- **Responsive**: Works on mobile and desktop
- **Accessible**: Proper ARIA labels and keyboard navigation

## Architecture

### Frontend
- **Component**: `components/Notifications.tsx`
- **Integration**: Added to `components/AppLayout.tsx`
- **State Management**: React hooks with polling
- **Navigation**: Integrated with Next.js router

### Backend
- **Database**: Supabase with RLS
- **API Routes**: Next.js API routes
- **Type Safety**: TypeScript types in `lib/supabase.ts`

## Future Enhancements (Ready to implement)

1. **Full Notifications Page** (`/notifications`)
   - View all notifications
   - Filter by type
   - Mark all as read
   - Delete notifications

2. **Real-time Updates**
   - Replace polling with Supabase real-time subscriptions
   - Instant notification delivery

3. **Notification Preferences**
   - User settings for notification types
   - Email notifications option

4. **More Notification Types**
   - Connection accepted/rejected
   - Gift reminders
   - System announcements

## Translations

All notification strings are translated in English and Hebrew:
- `notifications.title`
- `notifications.empty`
- `notifications.refresh`
- `notifications.viewAll`
- `notifications.type.*`
- `notifications.invite.*`

## Testing Checklist

- [ ] Run database migration
- [ ] Test notification creation when invite is generated
- [ ] Test notification dropdown opens/closes
- [ ] Test mark as read functionality
- [ ] Test polling (wait 30 seconds, check auto-refresh)
- [ ] Test refresh button
- [ ] Test navigation from notification click
- [ ] Test unread count badge
- [ ] Test empty state
- [ ] Test on mobile devices

