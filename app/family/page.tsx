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
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendIcon from '@mui/icons-material/Send';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CheckIcon from '@mui/icons-material/Check';
import { QRCodeSVG } from 'qrcode.react';
import { supabase, FamilyMember, UserConnection } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';

export default function FamilyPage() {
  const { user, loading: authLoading, setSharedContext } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberColor, setMemberColor] = useState('#e91e63'); // Default pink
  const [error, setError] = useState('');
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [childPhone, setChildPhone] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const COLOR_OPTIONS = [
    { name: t('color.pink'), value: '#e91e63' },
    { name: t('color.purple'), value: '#9c27b0' },
    { name: t('color.blue'), value: '#2196f3' },
    { name: t('color.cyan'), value: '#00bcd4' },
    { name: t('color.teal'), value: '#009688' },
    { name: t('color.green'), value: '#4caf50' },
    { name: t('color.orange'), value: '#ff9800' },
    { name: t('color.red'), value: '#f44336' },
    { name: t('color.brown'), value: '#795548' },
    { name: t('color.grey'), value: '#607d8b' },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadMembers();
      loadConnections();
    }
  }, [user]);

  const loadMembers = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error loading family members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (member?: FamilyMember) => {
    if (member) {
      setEditingMember(member);
      setMemberName(member.name);
      setMemberColor(member.color || '#e91e63');
    } else {
      setEditingMember(null);
      setMemberName('');
      setMemberColor('#e91e63');
    }
    setDialogOpen(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMember(null);
    setMemberName('');
    setMemberColor('#e91e63');
    setError('');
  };

  const handleSave = async () => {
    if (!memberName.trim()) {
      setError(t('family.errorName'));
      return;
    }

    try {
      if (editingMember) {
        const { error } = await supabase
          .from('family_members')
          .update({ 
            name: memberName,
            color: memberColor,
          })
          .eq('id', editingMember.id)
          .eq('user_id', user!.id); // Ensure user owns this record

        if (error) throw error;
      } else {
        const { error } = await supabase.from('family_members').insert({
          user_id: user!.id,
          name: memberName,
          color: memberColor,
        });

        if (error) throw error;
      }

      handleCloseDialog();
      loadMembers();
    } catch (err: any) {
      setError(err.message || t('family.errorSave'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('family.deleteConfirm'))) {
      return;
    }

    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id); // Ensure user owns this record

      if (error) throw error;
      loadMembers();
    } catch (error) {
      console.error('Error deleting family member:', error);
    }
  };

  const loadConnections = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `/api/connections/shared?parentUserId=${user.id}`
      );
      const data = await response.json();

      if (response.ok) {
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const handleOpenLinkDialog = () => {
    setLinkDialogOpen(true);
    setChildPhone('');
    setInviteUrl('');
    setInviteToken('');
    setError('');
  };

  const handleCloseLinkDialog = () => {
    setLinkDialogOpen(false);
    setChildPhone('');
    setInviteUrl('');
    setInviteToken('');
    setError('');
    setLinkCopied(false);
    setSmsSent(false);
  };

  const handleGenerateInvite = async () => {
    if (!childPhone.trim() || !user) {
      setError('Phone number is required');
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
          parentUserId: user.id,
          childPhone: childPhone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate invite');
      }

      setInviteUrl(data.inviteUrl);
      setInviteToken(data.inviteToken);
      loadConnections();
    } catch (err: any) {
      setError(err.message || 'Failed to generate invite');
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
    if (!inviteUrl || !childPhone || !user) return;

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
          phone: childPhone.trim(),
          inviteUrl: inviteUrl,
          parentPhone: user.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send SMS');
      }

      // Success
      setSmsSent(true);
      setError('');
      setTimeout(() => setSmsSent(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS');
    } finally {
      setSendingSMS(false);
    }
  };

  const handleRevokeConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to revoke this connection? You will no longer be able to access this child\'s ledger.')) {
      return;
    }

    if (!user) return;

    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          role: 'parent',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to revoke connection');
      }

      loadConnections();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke connection');
    }
  };

  const handleViewChildLedger = (connection: UserConnection) => {
    if (!user) return;
    
    // Set shared context to view child's ledger
    setSharedContext({
      connectionId: connection.id,
      childUserId: connection.child_user_id,
      permission: connection.permission,
      childPhone: connection.child_user?.phone || 'Unknown',
    });
    router.push('/dashboard');
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
              {t('family.title')}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<LinkIcon />}
                onClick={handleOpenLinkDialog}
                sx={{
                  borderRadius: 1,
                  fontWeight: 500,
                  fontSize: { xs: '0.875rem', sm: '0.95rem' },
                  textTransform: 'none',
                }}
              >
                Link User
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  borderRadius: 1,
                  fontWeight: 500,
                  fontSize: { xs: '0.875rem', sm: '0.95rem' },
                  textTransform: 'none',
                }}
              >
                {t('family.addMember')}
              </Button>
            </Box>
          </Box>

          {members.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {t('family.noMembers')}
              </Typography>
            </Box>
          ) : (
            <List>
              {members.map((member) => (
                <ListItem
                  key={member.id}
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleOpenDialog(member)}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(member.id)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: 'background.default',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    pr: { xs: 8, sm: 10 }, // Add padding-right to prevent overlap with icons
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      borderColor: 'rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: member.color || '#e91e63',
                      mr: 2,
                      flexShrink: 0,
                    }}
                  />
                  <ListItemText
                    primary={member.name}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: '1.1rem',
                    }}
                    sx={{
                      pr: 1, // Add padding-right to text to ensure spacing
                      flex: '1 1 auto',
                      minWidth: 0, // Allow text to shrink if needed
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}

          {connections.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 600, fontSize: '1.125rem' }}
              >
                Linked Children
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                View and manage access to your children's ledgers.
              </Typography>
              <List>
                {connections.map((connection) => (
                  <ListItem
                    key={connection.id}
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton
                          edge="end"
                          aria-label="view ledger"
                          onClick={() => handleViewChildLedger(connection)}
                          size="small"
                          sx={{ color: '#667eea' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="revoke"
                          onClick={() => handleRevokeConnection(connection.id)}
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
                      pr: { xs: 10, sm: 12 },
                      '&:hover': {
                        bgcolor: '#f9fafb',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" fontWeight={500}>
                            {connection.child_user?.phone || 'Unknown'}
                          </Typography>
                          <Chip
                            label={
                              connection.permission === 'read'
                                ? 'Read Only'
                                : 'Read & Write'
                            }
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                      }
                      secondary={`Connected on ${new Date(connection.created_at).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>

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
            {inviteUrl ? 'Share Invite Link' : 'Link User'}
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
                  Enter the phone number of the user you want to link with. They
                  will receive an invite to share their ledger with you.
                </Typography>
                <TextField
                  autoFocus
                  fullWidth
                  label="Phone Number"
                  type="tel"
                  value={childPhone}
                  onChange={(e) => setChildPhone(e.target.value)}
                  placeholder="e.g., 0512345678"
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    },
                  }}
                />
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                  Invite link generated! Share it via QR code, link, or SMS.
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
                    Scan to open invite link
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
                    Or share this link:
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
                      Link copied!
                    </Typography>
                  )}
                </Box>

                {/* SMS Section */}
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={smsSent ? <CheckIcon /> : <SendIcon />}
                    onClick={handleSendSMS}
                    disabled={sendingSMS || !childPhone}
                    fullWidth
                    sx={{
                      borderRadius: 1,
                      textTransform: 'none',
                      borderColor: smsSent ? '#10b981' : undefined,
                      color: smsSent ? '#10b981' : undefined,
                    }}
                  >
                    {smsSent
                      ? 'SMS Sent!'
                      : sendingSMS
                      ? 'Sending...'
                      : 'Send via SMS'}
                  </Button>
                  {smsSent && (
                    <Typography
                      variant="caption"
                      sx={{ mt: 0.5, display: 'block', textAlign: 'center', color: '#10b981' }}
                    >
                      SMS sent successfully to {childPhone}
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={handleCloseLinkDialog} sx={{ borderRadius: 1, textTransform: 'none' }}>
              {inviteUrl ? 'Close' : 'Cancel'}
            </Button>
            {!inviteUrl && (
              <Button
                onClick={handleGenerateInvite}
                variant="contained"
                disabled={generating || !childPhone.trim()}
                sx={{ borderRadius: 1, textTransform: 'none' }}
              >
                {generating ? 'Generating...' : 'Generate Link'}
              </Button>
            )}
          </DialogActions>
        </Dialog>

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
            {editingMember ? t('family.editTitle') : t('family.addTitle')}
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
              label={t('family.nameLabel')}
              type="text"
              fullWidth
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              sx={{ mt: 2, mb: 3 }}
            />

            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600 }}>
              {t('family.colorLabel')}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              {COLOR_OPTIONS.map((color) => (
                <Box
                  key={color.value}
                  onClick={() => setMemberColor(color.value)}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: color.value,
                    cursor: 'pointer',
                    border: memberColor === color.value ? '3px solid #000' : '3px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    },
                  }}
                  title={color.name}
                />
              ))}
            </Box>
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
