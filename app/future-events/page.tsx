'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Fab,
  CircularProgress,
  Alert,
  Autocomplete,
  Card,
  CardContent,
  CardActions,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';
import NotesIcon from '@mui/icons-material/Notes';
import { FutureEvent, supabase } from '@/lib/supabase';
import { format, parseISO, isPast, isToday, isFuture, differenceInDays } from 'date-fns';
import AppLayout from '@/components/AppLayout';

export default function FutureEventsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<FutureEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FutureEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [showOnlyFuture, setShowOnlyFuture] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    eventType: '',
    date: '',
    notes: '',
  });

  // Load events and event types
  useEffect(() => {
    if (user && !authLoading) {
      loadEvents();
      loadEventTypes();
    }
  }, [user, authLoading]);

  const loadEvents = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/future-events?userId=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load events');
      }

      setEvents(data.events || []);
    } catch (err: any) {
      console.error('Error loading events:', err);
      setError(err.message || t('futureEvents.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const loadEventTypes = async () => {
    if (!user?.id) return;

    try {
      // Load from existing event types in the database (from gifts)
      const { data: eventTypesData } = await supabase
        .from('event_types')
        .select('name')
        .eq('user_id', user.id)
        .order('name');

      if (eventTypesData) {
        setEventTypes(eventTypesData.map((et) => et.name));
      }

      // Also extract unique event types from existing future events
      const response = await fetch(`/api/future-events?userId=${user.id}`);
      const data = await response.json();
      if (data.events) {
        const uniqueTypes = new Set<string>();
        data.events.forEach((event: FutureEvent) => {
          if (event.event_type) uniqueTypes.add(event.event_type);
        });
        setEventTypes((prev) => [...prev, ...Array.from(uniqueTypes)]);
      }
    } catch (err) {
      console.error('Error loading event types:', err);
    }
  };

  const handleOpenDialog = (event?: FutureEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        name: event.name,
        eventType: event.event_type || '',
        date: event.date,
        notes: event.notes || '',
      });
    } else {
      setEditingEvent(null);
      setFormData({
        name: '',
        eventType: '',
        date: '',
        notes: '',
      });
    }
    setDialogOpen(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEvent(null);
    setFormData({
      name: '',
      eventType: '',
      date: '',
      notes: '',
    });
    setError('');
  };

  const handleSave = async () => {
    if (!user?.id) return;

    if (!formData.name.trim()) {
      setError(t('futureEvents.errorNameRequired'));
      return;
    }

    if (!formData.date) {
      setError(t('futureEvents.errorDateRequired'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      const url = editingEvent
        ? `/api/future-events/${editingEvent.id}`
        : '/api/future-events';

      const method = editingEvent ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          name: formData.name.trim(),
          eventType: formData.eventType.trim() || null,
          date: formData.date,
          notes: formData.notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('futureEvents.errorSave'));
      }

      handleCloseDialog();
      loadEvents();
    } catch (err: any) {
      console.error('Error saving event:', err);
      setError(err.message || t('futureEvents.errorSave'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!user?.id) return;
    if (!confirm(t('futureEvents.deleteConfirm'))) return;

    try {
      const response = await fetch(`/api/future-events/${eventId}?userId=${user.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('futureEvents.errorDelete'));
      }

      loadEvents();
    } catch (err: any) {
      console.error('Error deleting event:', err);
      setError(err.message || t('futureEvents.errorDelete'));
    }
  };

  const getEventStatus = (dateString: string) => {
    const date = parseISO(dateString);
    if (isPast(date) && !isToday(date)) {
      return { label: t('futureEvents.past'), color: 'error' as const }; // Red for past events
    }
    if (isToday(date)) {
      return { label: t('futureEvents.today'), color: 'warning' as const };
    }
    const daysUntil = differenceInDays(date, new Date());
    if (daysUntil <= 7) {
      return { label: t('futureEvents.upcoming'), color: 'success' as const }; // Green for upcoming
    }
    return { label: t('futureEvents.future'), color: 'primary' as const };
  };
  
  // Filter events based on showOnlyFuture toggle
  const filteredEvents = showOnlyFuture
    ? events.filter((event) => {
        const eventDate = parseISO(event.date);
        return isFuture(eventDate) || isToday(eventDate);
      })
    : events;

  const formatEventDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, language === 'he' ? 'dd/MM/yyyy' : 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {t('futureEvents.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('futureEvents.description')}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={showOnlyFuture}
                  onChange={(e) => setShowOnlyFuture(e.target.checked)}
                  color="primary"
                />
              }
              label={t('futureEvents.showOnlyFuture')}
              sx={{ ml: 2 }}
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {filteredEvents.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: 'background.default',
            }}
          >
            <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {t('futureEvents.noEvents')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('futureEvents.noEventsDesc')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              {t('futureEvents.addEvent')}
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredEvents.map((event) => {
              const status = getEventStatus(event.date);
              return (
                <Card
                  key={event.id}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 4,
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {event.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 1 }}>
                          <Chip
                            icon={<CalendarTodayIcon />}
                            label={formatEventDate(event.date)}
                            size="small"
                            sx={{ borderRadius: 1 }}
                          />
                          {event.event_type && (
                            <Chip
                              label={event.event_type}
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: 1 }}
                            />
                          )}
                          <Chip
                            label={status.label}
                            size="small"
                            color={status.color}
                            sx={{ borderRadius: 1 }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(event)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(event.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    {event.notes && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 1.5,
                          bgcolor: 'action.hover',
                          borderRadius: 1,
                          display: 'flex',
                          gap: 1,
                        }}
                      >
                        <NotesIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.25 }} />
                        <Typography variant="body2" color="text.secondary">
                          {event.notes}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}

        {/* Add/Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            {editingEvent ? t('futureEvents.editEvent') : t('futureEvents.addEvent')}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
              <TextField
                fullWidth
                label={t('futureEvents.nameLabel')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                autoFocus
              />

              <Autocomplete
                freeSolo
                options={eventTypes}
                value={formData.eventType}
                onChange={(e, newValue) => setFormData({ ...formData, eventType: newValue || '' })}
                onInputChange={(e, newValue) => setFormData({ ...formData, eventType: newValue })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('futureEvents.eventTypeLabel')}
                    placeholder={t('futureEvents.eventTypePlaceholder')}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                )}
              />

              <TextField
                fullWidth
                label={t('futureEvents.dateLabel')}
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                fullWidth
                label={t('futureEvents.notesLabel')}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={3}
                placeholder={t('futureEvents.notesPlaceholder')}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
              {t('futureEvents.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={saving}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              {saving ? <CircularProgress size={20} /> : t('futureEvents.save')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => handleOpenDialog()}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <AddIcon />
        </Fab>
      </Container>
    </AppLayout>
  );
}

