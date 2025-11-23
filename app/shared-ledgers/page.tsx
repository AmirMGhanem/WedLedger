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
  CircularProgress,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase, UserConnection } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';

export default function SharedLedgersPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<UserConnection | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<'read' | 'read_write'>('read');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadConnections();
    }
  }, [user]);

  const loadConnections = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `/api/connections/my-connections?childUserId=${user.id}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load connections');
      }

      setConnections(data.connections || []);
    } catch (err: any) {
      setError(err.message || t('sharedLedgers.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = (connection: UserConnection) => {
    setEditingConnection(connection);
    setSelectedPermission(connection.permission);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingConnection(null);
    setError('');
  };

  const handleUpdatePermission = async () => {
    if (!editingConnection || !user) return;

    try {
      const response = await fetch(`/api/connections/${editingConnection.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childUserId: user.id,
          permission: selectedPermission,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('sharedLedgers.errorUpdate'));
      }

      handleCloseEditDialog();
      loadConnections();
    } catch (err: any) {
      setError(err.message || t('sharedLedgers.errorUpdate'));
    }
  };

  const handleRevoke = async (connectionId: string) => {
    if (!user) return;
    if (!confirm(t('sharedLedgers.revokeConfirm'))) {
      return;
    }

    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          role: 'child',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('sharedLedgers.errorRevoke'));
      }

      loadConnections();
    } catch (err: any) {
      setError(err.message || t('sharedLedgers.errorRevoke'));
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
            borderRadius: 2,
            border: '1px solid #e5e7eb',
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              mb: 2,
            }}
          >
            {t('sharedLedgers.title')}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            {t('sharedLedgers.description')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {connections.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {t('sharedLedgers.emptyState')}
              </Typography>
            </Box>
          ) : (
            <List>
              {connections.map((connection) => (
                <ListItem
                  key={connection.id}
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton
                        edge="end"
                        aria-label={t('sharedLedgers.editPermission')}
                        onClick={() => handleOpenEditDialog(connection)}
                        size="small"
                        sx={{ color: '#667eea' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label={t('sharedLedgers.revoke')}
                        onClick={() => handleRevoke(connection.id)}
                        size="small"
                        sx={{ color: '#ef4444' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'background.default',
                    border: '1px solid #e5e7eb',
                    pr: { xs: 8, sm: 10 },
                    '&:hover': {
                      bgcolor: '#f9fafb',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight={500}>
                          {connection.parent_user?.phone || t('sharedLedgers.unknownUser')}
                        </Typography>
                        <Chip
                          label={
                            connection.permission === 'read'
                              ? t('sharedLedgers.readOnly')
                              : t('sharedLedgers.readWrite')
                          }
                          size="small"
                          color={
                            connection.permission === 'read'
                              ? 'default'
                              : 'primary'
                          }
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {t('sharedLedgers.connectedOn')}{' '}
                        {new Date(connection.created_at).toLocaleDateString()}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Dialog
            open={editDialogOpen}
            onClose={handleCloseEditDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
              },
            }}
          >
            <DialogTitle sx={{ pb: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' }, fontWeight: 600 }}>
              {t('sharedLedgers.editPermissionTitle')}
            </DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('sharedLedgers.editPermissionDescription').replace('{user}', editingConnection?.parent_user?.phone || t('sharedLedgers.thisUser'))}
              </Typography>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>{t('sharedLedgers.permission')}</InputLabel>
                <Select
                  value={selectedPermission}
                  label={t('sharedLedgers.permission')}
                  onChange={(e) => setSelectedPermission(e.target.value as 'read' | 'read_write')}
                >
                  <MenuItem value="read">{t('sharedLedgers.readOnlyOption')}</MenuItem>
                  <MenuItem value="read_write">{t('sharedLedgers.readWriteOption')}</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button onClick={handleCloseEditDialog} sx={{ borderRadius: 1, textTransform: 'none' }}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleUpdatePermission}
                variant="contained"
                sx={{ borderRadius: 1, textTransform: 'none' }}
              >
                {t('sharedLedgers.update')}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    </AppLayout>
  );
}

