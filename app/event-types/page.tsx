'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { supabase, EventType } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';

export default function EventTypesPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<EventType | null>(null);
  const [typeName, setTypeName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadEventTypes();
    }
  }, [user]);

  const loadEventTypes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setEventTypes(data || []);
    } catch (error) {
      console.error('Error loading event types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type?: EventType) => {
    if (type) {
      setEditingType(type);
      setTypeName(type.name);
    } else {
      setEditingType(null);
      setTypeName('');
    }
    setDialogOpen(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingType(null);
    setTypeName('');
    setError('');
  };

  const handleSave = async () => {
    if (!typeName.trim()) {
      setError(t('eventTypes.errorName'));
      return;
    }

    try {
      if (editingType) {
        const { error } = await supabase
          .from('event_types')
          .update({ name: typeName })
          .eq('id', editingType.id)
          .eq('user_id', user!.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('event_types').insert({
          user_id: user!.id,
          name: typeName,
        });

        if (error) throw error;
      }

      handleCloseDialog();
      loadEventTypes();
    } catch (err: any) {
      setError(err.message || t('eventTypes.errorSave'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('eventTypes.deleteConfirm'))) {
      return;
    }

    try {
      const { error } = await supabase
        .from('event_types')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
      loadEventTypes();
    } catch (error) {
      console.error('Error deleting event type:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              {t('eventTypes.title')}
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                px: { xs: 2, sm: 3 },
                boxShadow: '0 4px 12px rgba(233,30,99,0.25)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(233,30,99,0.35)',
                },
              }}
            >
              {t('eventTypes.addType')}
            </Button>
          </Box>

          {eventTypes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {t('eventTypes.noTypes')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('eventTypes.examples')}
              </Typography>
            </Box>
          ) : (
            <List>
              {eventTypes.map((type) => (
                <ListItem
                  key={type.id}
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleOpenDialog(type)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(type.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: 'background.default',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      borderColor: 'rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <ListItemText
                    primary={type.name}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: '1.1rem',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }
          }}
        >
          <DialogTitle sx={{ pb: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            {editingType ? t('eventTypes.editTitle') : t('eventTypes.addTitle')}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label={t('eventTypes.nameLabel')}
              type="text"
              fullWidth
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              placeholder={t('eventTypes.namePlaceholder')}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button 
              onClick={handleCloseDialog} 
              sx={{ borderRadius: 2 }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{ 
                borderRadius: 2,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(233,30,99,0.25)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(233,30,99,0.35)',
                },
              }}
            >
              {t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AppLayout>
  );
}

