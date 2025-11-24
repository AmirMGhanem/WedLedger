'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AppLayout from '@/components/AppLayout';

type InviteConnection = {
  id: string;
  parent_user_id: string;
  child_user_id: string;
  permission: 'read' | 'read_write';
  status: 'pending' | 'accepted' | 'revoked';
  invite_token: string;
  invite_expires_at: string;
  isExpired: boolean;
  parent_user?: {
    id: string;
    phone: string;
  };
  child_user?: {
    id: string;
    phone: string;
  };
};

export default function InvitePage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [connection, setConnection] = useState<InviteConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (token && user) {
      loadInvite();
    }
  }, [token, user]);

  const loadInvite = async () => {
    if (!token || !user) return;

    try {
      const response = await fetch(`/api/invites/accept?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load invite');
        return;
      }

      // Verify this invite is for the current user (parent accepts from child)
      if (data.connection && data.connection.parent_user_id !== user.id) {
        setError('This invite is not for your account');
        return;
      }

      setConnection(data.connection);
    } catch (err: any) {
      setError(err.message || 'Failed to load invite');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user || !connection) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: connection.invite_token,
          parentUserId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to accept invite');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invite');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = () => {
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

  if (success) {
    return (
      <AppLayout>
        <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 6 } }}>
          <Paper
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <CheckCircleIcon
              sx={{ fontSize: 64, color: '#10b981', mb: 2 }}
            />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              {t('invite.accepted')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('invite.acceptedDesc')}
            </Typography>
          </Paper>
        </Container>
      </AppLayout>
    );
  }

  if (error && !connection) {
    return (
      <AppLayout>
        <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 6 } }}>
          <Paper
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <CancelIcon sx={{ fontSize: 64, color: '#ef4444', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              {t('invite.invalid')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/dashboard')}
            >
              {t('invite.goToDashboard')}
            </Button>
          </Paper>
        </Container>
      </AppLayout>
    );
  }

  if (!connection) {
    return null;
  }

  // Helper function to get user display name
  const getUserDisplayName = (userData: { firstname?: string; lastname?: string; phone?: string } | null | undefined) => {
    if (!userData) return 'Unknown';
    if (userData.firstname && userData.lastname) {
      return `${userData.firstname} ${userData.lastname} (${userData.phone})`;
    }
    if (userData.firstname) {
      return `${userData.firstname} (${userData.phone})`;
    }
    return userData.phone || 'Unknown';
  };

  const childDisplayName = getUserDisplayName(connection.child_user);

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 6 } }}>
        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            {t('invite.connectionRequest')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t('invite.shareRequest').replace('{name}', childDisplayName)}
          </Typography>

          {connection.isExpired && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {t('invite.expired')}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Show permission level set by child */}
          <Box
            sx={{
              mb: 4,
              p: 2,
              bgcolor: connection.permission === 'read' ? '#fef3c7' : '#dbeafe',
              borderRadius: 1,
              border: `1px solid ${connection.permission === 'read' ? '#fbbf24' : '#60a5fa'}`,
            }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              {t('invite.permissionLevel')}
            </Typography>
            <Typography variant="body1" fontWeight={500} sx={{ mb: 0.5 }}>
              {connection.permission === 'read'
                ? t('invite.readOnly')
                : t('invite.readWrite')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {connection.permission === 'read'
                ? t('invite.readOnlyDesc')
                : t('invite.readWriteDesc')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleDecline}
              disabled={submitting}
              sx={{ borderRadius: 1 }}
            >
              {t('invite.decline')}
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAccept}
              disabled={submitting || connection.isExpired}
              sx={{ borderRadius: 1 }}
            >
              {submitting ? t('invite.accepting') : t('invite.accept')}
            </Button>
          </Box>
        </Paper>
      </Container>
    </AppLayout>
  );
}

