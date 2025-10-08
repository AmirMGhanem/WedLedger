'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import AppLayout from '@/components/AppLayout';
import PersonIcon from '@mui/icons-material/Person';
import LinkIcon from '@mui/icons-material/Link';
import DownloadIcon from '@mui/icons-material/Download';
import TuneIcon from '@mui/icons-material/Tune';
import InfoIcon from '@mui/icons-material/Info';
import GoogleIcon from '@mui/icons-material/Google';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TableChartIcon from '@mui/icons-material/TableChart';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DataObjectIcon from '@mui/icons-material/DataObject';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import DescriptionIcon from '@mui/icons-material/Description';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);

  // Mock states for UI
  const [displayName, setDisplayName] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('ILS');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // Mock integration statuses
  const [integrations, setIntegrations] = useState({
    googleSheets: false,
  });

  if (authLoading) {
    return null;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleIntegration = (service: keyof typeof integrations) => {
    setIntegrations({
      ...integrations,
      [service]: !integrations[service],
    });
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 3,
            fontWeight: 700,
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
          }}
        >
          {t('settings.title')} Comming soon... 
        </Typography>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  fontSize: { xs: '0.875rem', sm: '0.95rem' },
                  fontWeight: 600,
                },
              }}
            >
              <Tab icon={<PersonIcon />} iconPosition="start" label={t('settings.profile')} />
              <Tab icon={<LinkIcon />} iconPosition="start" label={t('settings.integrations')} />
              <Tab icon={<DownloadIcon />} iconPosition="start" label={t('settings.export')} />
              <Tab icon={<TuneIcon />} iconPosition="start" label={t('settings.preferences')} />
              <Tab icon={<InfoIcon />} iconPosition="start" label={t('settings.about')} />
            </Tabs>
          </Box>

          {/* Profile Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: { xs: 2, sm: 4 }, maxWidth: 800, mx: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontSize: '1.25rem' }}>
                Personal Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label={t('settings.profile.name')}
                  placeholder={t('settings.profile.namePlaceholder')}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label={t('settings.profile.phone')}
                  value={user?.phone || ''}
                  disabled
                  helperText="Phone number cannot be changed"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>{t('settings.profile.language')}</InputLabel>
                  <Select
                    value={language}
                    label={t('settings.profile.language')}
                    onChange={(e) => setLanguage(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="en">🇺🇸 English</MenuItem>
                    <MenuItem value="he">🇮🇱 עברית</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      boxShadow: '0 4px 12px rgba(233,30,99,0.25)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(233,30,99,0.35)',
                      },
                    }}
                  >
                    {t('settings.profile.save')}
                  </Button>
                </Box>
              </Box>
            </Box>
          </TabPanel>

          {/* Integrations Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: { xs: 2, sm: 4 }, maxWidth: 900, mx: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: '1.25rem' }}>
                {t('settings.integrations.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Connect external services to enhance your experience
              </Typography>

              {/* Google Sheets */}
              <Card 
                variant="outlined" 
                sx={{ 
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: integrations.googleSheets ? 'success.main' : 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(33,115,70,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TableChartIcon sx={{ fontSize: 48, color: '#217346' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 700 }}>
                          Google Sheets
                        </Typography>
                        {integrations.googleSheets && (
                          <Chip 
                            label={t('settings.integrations.status.connected')} 
                            color="success" 
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {t('settings.integrations.excelDesc')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        • Real-time synchronization with your spreadsheets<br />
                        • Automatic backups and version history<br />
                        • Easy data analysis and reporting
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Button
                    variant={integrations.googleSheets ? 'outlined' : 'contained'}
                    onClick={() => toggleIntegration('googleSheets')}
                    color={integrations.googleSheets ? 'error' : 'primary'}
                    size="large"
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                      px: 3,
                      boxShadow: integrations.googleSheets ? 'none' : '0 4px 12px rgba(233,30,99,0.25)',
                    }}
                  >
                    {integrations.googleSheets ? t('settings.integrations.status.disconnect') : t('settings.integrations.status.connect')}
                  </Button>
                </CardActions>
              </Card>
            </Box>
          </TabPanel>

          {/* Export Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ px: { xs: 2, sm: 4 }, maxWidth: 900, mx: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: '1.25rem' }}>
                {t('settings.export.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Download your gift data in various formats
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* CSV Export */}
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'rgba(33,115,70,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <TableChartIcon sx={{ fontSize: 40, color: '#217346' }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontSize: '1.15rem', fontWeight: 700, mb: 0.5 }}>
                          {t('settings.export.csv')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('settings.export.csvDesc')}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        sx={{ 
                          borderRadius: 2,
                          fontWeight: 600,
                          px: 3,
                          boxShadow: '0 4px 12px rgba(233,30,99,0.25)',
                        }}
                      >
                        {t('settings.export.download')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                {/* PDF Export */}
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'rgba(211,47,47,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PictureAsPdfIcon sx={{ fontSize: 40, color: '#d32f2f' }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontSize: '1.15rem', fontWeight: 700, mb: 0.5 }}>
                          {t('settings.export.pdf')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('settings.export.pdfDesc')}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        sx={{ 
                          borderRadius: 2,
                          fontWeight: 600,
                          px: 3,
                          boxShadow: '0 4px 12px rgba(233,30,99,0.25)',
                        }}
                      >
                        {t('settings.export.download')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                {/* JSON Export */}
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'rgba(245,124,0,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <DataObjectIcon sx={{ fontSize: 40, color: '#f57c00' }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontSize: '1.15rem', fontWeight: 700, mb: 0.5 }}>
                          {t('settings.export.json')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('settings.export.jsonDesc')}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        sx={{ 
                          borderRadius: 2,
                          fontWeight: 600,
                          px: 3,
                          boxShadow: '0 4px 12px rgba(233,30,99,0.25)',
                        }}
                      >
                        {t('settings.export.download')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </TabPanel>

          {/* Preferences Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ px: { xs: 2, sm: 4 }, maxWidth: 800, mx: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: '1.25rem' }}>
                {t('settings.preferences.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Customize your app experience
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('settings.preferences.currency')}</InputLabel>
                  <Select
                    value={defaultCurrency}
                    label={t('settings.preferences.currency')}
                    onChange={(e) => setDefaultCurrency(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="ILS">₪ ILS - Israeli Shekel</MenuItem>
                    <MenuItem value="USD">$ USD - US Dollar</MenuItem>
                    <MenuItem value="EUR">€ EUR - Euro</MenuItem>
                    <MenuItem value="GBP">£ GBP - British Pound</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>{t('settings.preferences.dateFormat')}</InputLabel>
                  <Select
                    value={dateFormat}
                    label={t('settings.preferences.dateFormat')}
                    onChange={(e) => setDateFormat(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</MenuItem>
                  </Select>
                </FormControl>

                <Divider sx={{ my: 1 }} />

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {t('settings.preferences.notifications')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('settings.preferences.notificationsDesc')}
                        </Typography>
                      </Box>
                    }
                    sx={{ width: '100%', m: 0 }}
                  />
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {t('settings.preferences.darkMode')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('settings.preferences.darkModeDesc')}
                        </Typography>
                      </Box>
                    }
                    sx={{ width: '100%', m: 0 }}
                  />
                </Paper>
              </Box>
            </Box>
          </TabPanel>

          {/* About Tab */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ px: { xs: 2, sm: 4 }, maxWidth: 700, mx: 'auto' }}>
              <Box sx={{ textAlign: 'center', mb: 5, py: 3 }}>
                <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', fontSize: { xs: '2rem', sm: '2.5rem' } }}>
                  {t('app.name')}
                </Typography>
                <Chip 
                  label={`${t('settings.about.version')} 1.0.0`} 
                  sx={{ 
                    fontWeight: 600,
                    px: 2,
                    py: 0.5,
                    fontSize: '0.875rem'
                  }}
                />
              </Box>

              <List sx={{
                '& .MuiListItem-root': {
                  py: 2,
                  px: 3,
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }
              }}>
                <ListItem>
                  <ListItemText
                    primary={t('settings.about.developer')}
                    secondary="WedLedger Team"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary={t('settings.about.support')} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end">
                      <EmailIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary={t('settings.about.viewOnGithub')} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end">
                      <GitHubIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary={t('settings.about.terms')} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end">
                      <DescriptionIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary={t('settings.about.privacy')} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end">
                      <DescriptionIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </AppLayout>
  );
}
