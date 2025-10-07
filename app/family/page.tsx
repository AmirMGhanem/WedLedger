'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
import { supabase, FamilyMember } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';

export default function FamilyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [memberName, setMemberName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadMembers();
    }
  }, [user]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
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
    } else {
      setEditingMember(null);
      setMemberName('');
    }
    setDialogOpen(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMember(null);
    setMemberName('');
    setError('');
  };

  const handleSave = async () => {
    if (!memberName.trim()) {
      setError('Name is required');
      return;
    }

    try {
      if (editingMember) {
        const { error } = await supabase
          .from('family_members')
          .update({ name: memberName })
          .eq('id', editingMember.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('family_members').insert({
          user_id: user!.id,
          name: memberName,
        });

        if (error) throw error;
      }

      handleCloseDialog();
      loadMembers();
    } catch (err: any) {
      setError(err.message || 'Failed to save family member');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this family member?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadMembers();
    } catch (error) {
      console.error('Error deleting family member:', error);
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
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
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              Family Members
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Add Member
            </Button>
          </Box>

          {members.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No family members added yet
              </Typography>
            </Box>
          ) : (
            <List>
              {members.map((member) => (
                <ListItem
                  key={member.id}
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleOpenDialog(member)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(member.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: 'background.default',
                  }}
                >
                  <ListItemText
                    primary={member.name}
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

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingMember ? 'Edit Family Member' : 'Add Family Member'}
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
              label="Name"
              type="text"
              fullWidth
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AppLayout>
  );
}
