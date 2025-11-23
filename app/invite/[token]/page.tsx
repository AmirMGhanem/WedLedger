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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
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
  const [permission, setPermission] = useState<'read' | 'read_write'>('read');
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

      // Verify this invite is for the current user
      if (data.connection && data.connection.child_user_id !== user.id) {
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
          permission: permission,
          childUserId: user.id,
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
              Invite Accepted!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You have successfully linked your ledger. Redirecting...
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
              Invalid Invite
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </Paper>
        </Container>
      </AppLayout>
    );
  }

  if (!connection) {
    return null;
  }

  const parentPhone = connection.parent_user?.phone || 'Unknown';

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
            Connection Request
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {parentPhone} wants to link with your ledger
          </Typography>

          {connection.isExpired && (
            <Alert severity="error" sx={{ mb: 3 }}>
              This invite has expired. Please request a new one.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500 }}>
              Choose Permission Level
            </FormLabel>
            <RadioGroup
              value={permission}
              onChange={(e) =>
                setPermission(e.target.value as 'read' | 'read_write')
              }
            >
              <FormControlLabel
                value="read"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      Read Only
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      They can view your gifts and family members, but cannot
                      make changes
                    </Typography>
                  </Box>
                }
                sx={{ mb: 2, alignItems: 'flex-start' }}
              />
              <FormControlLabel
                value="read_write"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      Read & Write
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      They can view, add, edit, and delete your gifts and
                      family members
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start' }}
              />
            </RadioGroup>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleDecline}
              disabled={submitting}
              sx={{ borderRadius: 1 }}
            >
              Decline
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAccept}
              disabled={submitting || connection.isExpired}
              sx={{ borderRadius: 1 }}
            >
              {submitting ? 'Accepting...' : 'Accept'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </AppLayout>
  );
}

