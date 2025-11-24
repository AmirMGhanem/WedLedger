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
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendIcon from '@mui/icons-material/Send';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { QRCodeSVG } from 'qrcode.react';
import { supabase, UserConnection } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';

export default function SharedLedgersPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Helper function to get user display name
  const getUserDisplayName = (userData: { firstname?: string; lastname?: string; phone?: string } | null | undefined) => {
    if (!userData) return t('sharedLedgers.unknownUser');
    if (userData.firstname && userData.lastname) {
      return `${userData.firstname} ${userData.lastname} (${userData.phone})`;
    }
    if (userData.firstname) {
      return `${userData.firstname} (${userData.phone})`;
    }
    return userData.phone || t('sharedLedgers.unknownUser');
  };
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<UserConnection | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<'read' | 'read_write'>('read');
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [parentPhone, setParentPhone] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [sharePermission, setSharePermission] = useState<'read' | 'read_write'>('read');
  const [viewInviteDialogOpen, setViewInviteDialogOpen] = useState(false);
  const [viewingConnection, setViewingConnection] = useState<UserConnection | null>(null);

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
    // Only allow editing permissions for accepted connections
    if (connection.status !== 'accepted') return;
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

  const handleViewInviteLink = (connection: UserConnection) => {
    if (!connection.invite_token) return;
    
    // Generate invite URL using BASEURL from environment or current origin
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite/${connection.invite_token}`;
    
    setInviteUrl(inviteUrl);
    setInviteToken(connection.invite_token);
    setParentPhone(connection.parent_user?.phone || '');
    setViewingConnection(connection);
    setViewInviteDialogOpen(true);
    setLinkCopied(false);
    setSmsSent(false);
  };

  const handleCloseViewInviteDialog = () => {
    setViewInviteDialogOpen(false);
    setViewingConnection(null);
    setInviteUrl('');
    setInviteToken('');
    setLinkCopied(false);
    setSmsSent(false);
  };

  const handleOpenLinkDialog = () => {
    setLinkDialogOpen(true);
    setParentPhone('');
    setInviteUrl('');
    setInviteToken('');
    setError('');
    setLinkCopied(false);
    setSmsSent(false);
    setSharePermission('read');
  };

  const handleCloseLinkDialog = () => {
    setLinkDialogOpen(false);
    setParentPhone('');
    setInviteUrl('');
    setInviteToken('');
    setError('');
    setLinkCopied(false);
    setSmsSent(false);
  };

  const handleGenerateInvite = async () => {
    if (!parentPhone.trim() || !user) {
      setError(t('sharedLedgers.errorPhoneRequired'));
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/invites/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childUserId: user.id,
          parentPhone: parentPhone.trim(),
          permission: sharePermission,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('sharedLedgers.errorGenerate'));
      }

      setInviteUrl(data.inviteUrl);
      setInviteToken(data.inviteToken);
      loadConnections();
    } catch (err: any) {
      setError(err.message || t('sharedLedgers.errorGenerate'));
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (inviteUrl && typeof navigator !== 'undefined') {
      try {
        await navigator.clipboard.writeText(inviteUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleSendSMS = async () => {
    if (!inviteUrl || !parentPhone || !user) return;

    setSendingSMS(true);
    setError('');
    setSmsSent(false);

    try {
      const response = await fetch('/api/invites/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: parentPhone.trim(),
          inviteUrl: inviteUrl,
          childPhone: user.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('sharedLedgers.errorSendSMS'));
      }

      setSmsSent(true);
      setError('');
      setTimeout(() => setSmsSent(false), 3000);
    } catch (err: any) {
      setError(err.message || t('sharedLedgers.errorSendSMS'));
    } finally {
      setSendingSMS(false);
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

  // Get current user display name
  const getCurrentUserDisplayName = () => {
    if (!user?.user_metadata) return user?.phone || '';
    const { firstname, lastname } = user.user_metadata;
    if (firstname && lastname) {
      return `${firstname} ${lastname}`;
    }
    if (firstname) return firstname;
    return user.user_metadata.phone || user?.phone || '';
  };

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
        {/* Top Bar - You are viewing */}
        <Alert
          severity="info"
          sx={{
            mb: 3,
            borderRadius: 2,
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            '& .MuiAlert-icon': {
              color: '#2563eb',
            },
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {t('sharedLedgers.viewingAs').replace('{name}', getCurrentUserDisplayName())}
          </Typography>
        </Alert>

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

          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<LinkIcon />}
              onClick={handleOpenLinkDialog}
              sx={{
                borderRadius: 1,
                fontWeight: 600,
                textTransform: 'none',
                backgroundColor: '#667eea',
                '&:hover': {
                  backgroundColor: '#5568d3',
                },
              }}
            >
              {t('sharedLedgers.shareLedger')}
            </Button>
          </Box>

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
                      {connection.status === 'pending' && (
                        <IconButton
                          edge="end"
                          aria-label={t('sharedLedgers.viewInviteLink')}
                          onClick={() => handleViewInviteLink(connection)}
                          size="small"
                          sx={{ color: '#667eea' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      )}
                      {connection.status === 'accepted' && (
                        <IconButton
                          edge="end"
                          aria-label={t('sharedLedgers.editPermission')}
                          onClick={() => handleOpenEditDialog(connection)}
                          size="small"
                          sx={{ color: '#667eea' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
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
                    pr: { xs: connection.status === 'pending' ? 10 : 10, sm: connection.status === 'pending' ? 12 : 12 },
                    '&:hover': {
                      bgcolor: '#f9fafb',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body1" fontWeight={500}>
                          {getUserDisplayName(connection.parent_user)}
                        </Typography>
                        <Chip
                          label={
                            connection.status === 'pending'
                              ? t('sharedLedgers.pending')
                              : connection.status === 'accepted'
                              ? t('sharedLedgers.accepted')
                              : connection.status
                          }
                          size="small"
                          color={
                            connection.status === 'pending'
                              ? 'warning'
                              : connection.status === 'accepted'
                              ? 'success'
                              : 'default'
                          }
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 500,
                          }}
                        />
                        {connection.status === 'accepted' && (
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
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {connection.status === 'pending'
                          ? t('sharedLedgers.inviteSentOn').replace('{date}', new Date(connection.created_at).toLocaleDateString())
                          : t('sharedLedgers.connectedOn')}{' '}
                        {connection.status === 'accepted' && new Date(connection.created_at).toLocaleDateString()}
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
                {t('sharedLedgers.editPermissionDescription').replace('{user}', getUserDisplayName(editingConnection?.parent_user) || t('sharedLedgers.thisUser'))}
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

          {/* Share Ledger Dialog */}
          <Dialog
            open={linkDialogOpen}
            onClose={handleCloseLinkDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
              },
            }}
          >
            <DialogTitle
              sx={{
                pb: 1,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                fontWeight: 600,
              }}
            >
              {inviteUrl ? t('sharedLedgers.shareInviteTitle') : t('sharedLedgers.shareLedgerTitle')}
            </DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {!inviteUrl ? (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3, textAlign: 'center' }}
                  >
                    {t('sharedLedgers.shareDescription')}
                  </Typography>
                  <TextField
                    autoFocus
                    fullWidth
                    label={t('sharedLedgers.parentPhoneLabel')}
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder={t('sharedLedgers.parentPhonePlaceholder')}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      },
                    }}
                  />
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>{t('sharedLedgers.permission')}</InputLabel>
                    <Select
                      value={sharePermission}
                      label={t('sharedLedgers.permission')}
                      onChange={(e) => setSharePermission(e.target.value as 'read' | 'read_write')}
                    >
                      <MenuItem value="read">{t('sharedLedgers.readOnlyOption')}</MenuItem>
                      <MenuItem value="read_write">{t('sharedLedgers.readWriteOption')}</MenuItem>
                    </Select>
                  </FormControl>
                </>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                    {t('sharedLedgers.inviteGenerated')}
                  </Typography>

                  {/* QR Code Section */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      mb: 3,
                      p: 3,
                      bgcolor: '#fafafa',
                      borderRadius: 1,
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <QRCodeSVG
                      value={inviteUrl}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 2, textAlign: 'center' }}
                    >
                      {t('sharedLedgers.scanQR')}
                    </Typography>
                  </Box>

                  {/* Link Section */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      fontWeight={500}
                      color="text.secondary"
                      sx={{ mb: 1, display: 'block' }}
                    >
                      {t('sharedLedgers.orShareLink')}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                        p: 1.5,
                        bgcolor: '#f9fafb',
                        borderRadius: 1,
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          color: '#6b7280',
                        }}
                      >
                        {inviteUrl}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={handleCopyLink}
                        sx={{
                          flexShrink: 0,
                          color: linkCopied ? '#10b981' : '#6b7280',
                        }}
                      >
                        {linkCopied ? (
                          <CheckIcon fontSize="small" />
                        ) : (
                          <ContentCopyIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Box>
                    {linkCopied && (
                      <Typography
                        variant="caption"
                        sx={{ mt: 0.5, display: 'block', color: '#10b981' }}
                      >
                        {t('sharedLedgers.linkCopied')}
                      </Typography>
                    )}
                  </Box>

                  {/* SMS Section */}
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={smsSent ? <CheckIcon /> : <SendIcon />}
                      onClick={handleSendSMS}
                      disabled={sendingSMS || !parentPhone}
                      fullWidth
                      sx={{
                        borderRadius: 1,
                        textTransform: 'none',
                        borderColor: smsSent ? '#10b981' : undefined,
                        color: smsSent ? '#10b981' : undefined,
                      }}
                    >
                      {smsSent
                        ? t('sharedLedgers.smsSent')
                        : sendingSMS
                        ? t('sharedLedgers.sending')
                        : t('sharedLedgers.sendSMS')}
                    </Button>
                    {smsSent && (
                      <Typography
                        variant="caption"
                        sx={{ mt: 0.5, display: 'block', textAlign: 'center', color: '#10b981' }}
                      >
                        {t('sharedLedgers.smsSentTo').replace('{phone}', parentPhone)}
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button onClick={handleCloseLinkDialog} sx={{ borderRadius: 1, textTransform: 'none' }}>
                {inviteUrl ? t('common.close') : t('common.cancel')}
              </Button>
              {!inviteUrl && (
                <Button
                  onClick={handleGenerateInvite}
                  variant="contained"
                  disabled={generating || !parentPhone.trim()}
                  sx={{ borderRadius: 1, textTransform: 'none' }}
                >
                  {generating ? t('sharedLedgers.generating') : t('sharedLedgers.generateLink')}
                </Button>
              )}
            </DialogActions>
          </Dialog>

          {/* View Invite Link Dialog (for pending connections) */}
          <Dialog
            open={viewInviteDialogOpen}
            onClose={handleCloseViewInviteDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
              },
            }}
          >
            <DialogTitle
              sx={{
                pb: 1,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                fontWeight: 600,
              }}
            >
              {t('sharedLedgers.viewInviteLink')}
            </DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {inviteUrl && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                    {t('sharedLedgers.inviteLinkInfo')}
                  </Typography>

                  {/* QR Code Section */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      mb: 3,
                      p: 3,
                      bgcolor: '#fafafa',
                      borderRadius: 1,
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <QRCodeSVG
                      value={inviteUrl}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 2, textAlign: 'center' }}
                    >
                      {t('sharedLedgers.scanQR')}
                    </Typography>
                  </Box>

                  {/* Link Section */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      fontWeight={500}
                      color="text.secondary"
                      sx={{ mb: 1, display: 'block' }}
                    >
                      {t('sharedLedgers.orShareLink')}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                        p: 1.5,
                        bgcolor: '#f9fafb',
                        borderRadius: 1,
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          color: '#6b7280',
                        }}
                      >
                        {inviteUrl}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={handleCopyLink}
                        sx={{
                          flexShrink: 0,
                          color: linkCopied ? '#10b981' : '#6b7280',
                        }}
                      >
                        {linkCopied ? (
                          <CheckIcon fontSize="small" />
                        ) : (
                          <ContentCopyIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Box>
                    {linkCopied && (
                      <Typography
                        variant="caption"
                        sx={{ mt: 0.5, display: 'block', color: '#10b981' }}
                      >
                        {t('sharedLedgers.linkCopied')}
                      </Typography>
                    )}
                  </Box>

                  {/* SMS Section */}
                  {viewingConnection && viewingConnection.parent_user?.phone && (
                    <Box>
                      <Button
                        variant="outlined"
                        startIcon={smsSent ? <CheckIcon /> : <SendIcon />}
                        onClick={handleSendSMS}
                        disabled={sendingSMS || !parentPhone}
                        fullWidth
                        sx={{
                          borderRadius: 1,
                          textTransform: 'none',
                          borderColor: smsSent ? '#10b981' : undefined,
                          color: smsSent ? '#10b981' : undefined,
                        }}
                      >
                        {smsSent
                          ? t('sharedLedgers.smsSent')
                          : sendingSMS
                          ? t('sharedLedgers.sending')
                          : t('sharedLedgers.sendSMS')}
                      </Button>
                      {smsSent && (
                        <Typography
                          variant="caption"
                          sx={{ mt: 0.5, display: 'block', textAlign: 'center', color: '#10b981' }}
                        >
                          {t('sharedLedgers.smsSentTo').replace('{phone}', parentPhone)}
                        </Typography>
                      )}
                    </Box>
                  )}
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button onClick={handleCloseViewInviteDialog} sx={{ borderRadius: 1, textTransform: 'none' }}>
                {t('common.close')}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    </AppLayout>
  );
}

