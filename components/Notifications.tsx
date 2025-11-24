'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Button,
  CircularProgress,
  Tooltip,
  Chip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import { Notification } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';

interface NotificationsProps {
  userId: string;
}

const POLLING_INTERVAL = 30000; // 30 seconds

export default function Notifications({ userId }: NotificationsProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewNotificationTooltip, setShowNewNotificationTooltip] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const newNotificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const open = Boolean(anchorEl);

  const loadNotifications = async (showRefreshing = false): Promise<Notification[] | null> => {
    if (!userId) {
      console.warn('Notifications: No userId provided');
      return null;
    }

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError(null);
      const response = await fetch(`/api/notifications?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        console.error('Notifications API error:', {
          error: data.error,
          details: data.details,
          code: data.code,
          hint: data.hint,
        });
        // If table doesn't exist, show helpful message
        if (data.details?.includes('does not exist') || data.error?.includes('does not exist')) {
          setError('Notifications table not set up. Please run the database migration.');
        } else if (data.code === '23514' || data.details?.includes('violates check constraint')) {
          setError('Database constraint error. Please run the update_notifications_types.sql migration.');
        } else {
          setError(data.error || 'Failed to load notifications');
          if (data.details) {
            console.error('Error details:', data.details);
          }
          if (data.code) {
            console.error('Error code:', data.code);
          }
        }
        setNotifications([]);
        setUnreadCount(0);
        return null;
      }

      console.log('Notifications loaded:', data.notifications?.length || 0, 'unread:', data.unreadCount || 0);
      const newUnreadCount = data.unreadCount || 0;
      const loadedNotifications = data.notifications || [];
      
      // Show tooltip if new notification arrived
      if (newUnreadCount > previousUnreadCount && previousUnreadCount > 0) {
        setShowNewNotificationTooltip(true);
        if (newNotificationTimeoutRef.current) {
          clearTimeout(newNotificationTimeoutRef.current);
        }
        newNotificationTimeoutRef.current = setTimeout(() => {
          setShowNewNotificationTooltip(false);
        }, 3000); // Show tooltip for 3 seconds
      }
      
      setNotifications(loadedNotifications);
      setUnreadCount(newUnreadCount);
      setPreviousUnreadCount(newUnreadCount);
      setError(null);
      return loadedNotifications;
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      setError(error.message || 'Failed to load notifications');
      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
      return null;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) {
      console.log('Notifications: Setting up with userId:', userId);
      loadNotifications();
      
      // Set up polling
      pollingRef.current = setInterval(() => {
        loadNotifications();
      }, POLLING_INTERVAL);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
        if (newNotificationTimeoutRef.current) {
          clearTimeout(newNotificationTimeoutRef.current);
        }
      };
    } else {
      console.warn('Notifications: No userId available');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    
    // Load notifications and mark as read after loading
    const loadedNotifications = await loadNotifications();
    
    // Mark all notifications as read when opening the popover
    if (loadedNotifications && loadedNotifications.length > 0) {
      await markAllAsRead(loadedNotifications);
    }
  };

  const markAllAsRead = async (notificationsToMark: Notification[] = notifications) => {
    try {
      // Mark all unread notifications as read
      const unreadNotifications = notificationsToMark.filter(n => !n.read);
      
      if (unreadNotifications.length === 0) return;

      // Update all unread notifications in parallel
      const updatePromises = unreadNotifications.map((notification) =>
        fetch(`/api/notifications/${notification.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            read: true,
          }),
        })
      );

      await Promise.all(updatePromises);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = () => {
    loadNotifications(true);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          read: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'invite' && notification.related_id) {
      // Fetch the connection to get the invite token
      try {
        const { data: connection, error: connError } = await supabase
          .from('user_connections')
          .select('invite_token')
          .eq('id', notification.related_id)
          .single();

        if (!connError && connection?.invite_token) {
          router.push(`/invite/${connection.invite_token}`);
          handleClose();
        } else {
          console.error('Error fetching invite token:', connError);
          // Fallback: navigate to shared ledgers page
          router.push('/shared-ledgers');
          handleClose();
        }
      } catch (err) {
        console.error('Error handling invite notification:', err);
        router.push('/shared-ledgers');
        handleClose();
      }
    } else if (notification.type === 'connection') {
      // Navigate to family page for connection-related notifications
      router.push('/family');
      handleClose();
    } else if (notification.type === 'gift') {
      router.push('/dashboard');
      handleClose();
    }
    // For system notifications, just mark as read, no navigation
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <>
      <Tooltip 
        title={showNewNotificationTooltip ? t('notifications.newNotification') : t('notifications.title')}
        open={showNewNotificationTooltip || undefined}
      >
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{
            position: 'relative',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: { xs: '90vw', sm: 400 },
            maxHeight: 600,
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              {t('notifications.title')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  size="small"
                  color="error"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
              <Tooltip title={t('notifications.refresh')}>
                <IconButton
                  size="small"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  {refreshing ? (
                    <CircularProgress size={16} />
                  ) : (
                    <RefreshIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        <Divider />

        <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
          {error ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                {error}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Check browser console for details
              </Typography>
            </Box>
          ) : loading && !refreshing ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {t('notifications.empty')}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem
                    disablePadding
                    sx={{
                      backgroundColor: notification.read ? 'transparent' : '#f0f9ff',
                      '&:hover': {
                        backgroundColor: notification.read ? 'rgba(0, 0, 0, 0.04)' : '#e0f2fe',
                      },
                      transition: 'background-color 0.2s',
                      borderBottom: index < notifications.length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}
                  >
                    <ListItemButton
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        py: 0.75,
                        px: 1.5,
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box
                        sx={{
                          mr: 1,
                          mt: 0.25,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {notification.read ? (
                          <CircleIcon sx={{ fontSize: 6, color: 'text.disabled' }} />
                        ) : (
                          <CheckCircleIcon sx={{ fontSize: 6, color: 'primary.main' }} />
                        )}
                      </Box>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: notification.read ? 400 : 600,
                                flex: 1,
                                fontSize: '0.8125rem',
                                lineHeight: 1.4,
                              }}
                            >
                              {notification.title}
                            </Typography>
                            {notification.type === 'invite' && (
                              <Chip
                                label={t('notifications.type.invite')}
                                size="small"
                                color="primary"
                                sx={{ height: 16, fontSize: '0.6rem', minWidth: 'auto', px: 0.5 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', mb: 0.25, fontSize: '0.75rem', lineHeight: 1.3 }}
                            >
                              {notification.content}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{ fontSize: '0.65rem' }}
                            >
                              {formatTimeAgo(notification.created_at)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                </Box>
              ))}
            </List>
          )}
        </Box>

      </Popover>
    </>
  );
}

