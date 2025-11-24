'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LanguageIcon from '@mui/icons-material/Language';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Notifications from './Notifications';

const DRAWER_WIDTH = 280;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);
  const { user, signOut, sharedContext, clearSharedContext } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const getUserDisplayName = () => {
    if (!user?.user_metadata) return '';
    const { firstname, lastname } = user.user_metadata;
    if (firstname && lastname) {
      return `${firstname} ${lastname}`;
    }
    if (firstname) return firstname;
    if (lastname) return lastname;
    return user.user_metadata.phone || '';
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setLangMenuAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLangMenuAnchor(null);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    handleLanguageClose();
  };

  // Define all menu items
  const allMenuItems = [
    {
      text: t('nav.myGifts'),
      icon: <CardGiftcardIcon />,
      path: '/dashboard',
      showInShared: true, // Show when viewing shared ledger
    },
    {
      text: t('nav.analytics'),
      icon: <AnalyticsIcon />,
      path: '/analytics',
      showInShared: true, // Show when viewing shared ledger
    },
    {
      text: t('nav.futureEvents'),
      icon: <EventIcon />,
      path: '/future-events',
      showInShared: false, // Not shareable context
    },
    {
      text: t('nav.familyMembers'),
      icon: <PeopleIcon />,
      path: '/family',
      showInShared: false, // Hide in shared view
    },
    {
      text: t('nav.sharedWithOthers'),
      icon: <ShareIcon />,
      path: '/shared-ledgers',
      showInShared: false, // Only show in own ledger
    },
    {
      text: t('nav.eventTypes'),
      icon: <EventIcon />,
      path: '/event-types',
      showInShared: false, // Management item, not for shared view
    },
    {
      text: t('nav.giftTypes'),
      icon: <CategoryIcon />,
      path: '/gift-types',
      showInShared: false, // Management item, not for shared view
    },
    {
      text: t('nav.settings'),
      icon: <SettingsIcon />,
      path: '/settings',
      showInShared: false, // Management item, not for shared view
    },
  ];

  // Filter menu items based on shared context
  const menuItems = sharedContext
    ? allMenuItems.filter(item => item.showInShared)
    : allMenuItems;

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 3,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: 40,
            height: 40,
            flexShrink: 0,
          }}
        >
          <Image
            src="/logo.png"
            alt="WedLedger"
            fill
            style={{ objectFit: 'contain' }}
          />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
          {t('app.name')}
        </Typography>
      </Toolbar>

      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={pathname === item.path}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: '#f3f4f6',
                  color: '#667eea',
                  '&:hover': {
                    bgcolor: '#f3f4f6',
                  },
                },
                '&:hover': {
                  bgcolor: '#f9fafb',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: pathname === item.path ? '#667eea' : '#6b7280',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: pathname === item.path ? 500 : 400,
                  fontSize: '0.9375rem',
                  color: pathname === item.path ? '#111827' : '#6b7280',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}

        <ListItem disablePadding sx={{ mt: 2 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              mx: 1,
              borderRadius: 1,
              color: '#dc2626',
              '&:hover': {
                bgcolor: '#fef2f2',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#dc2626', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary={t('nav.logout')}
              primaryTypographyProps={{
                fontSize: '0.9375rem',
                fontWeight: 400,
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: sharedContext 
            ? (sharedContext.permission === 'read' ? '#fef3c7' : '#dbeafe')
            : '#ffffff',
          color: sharedContext 
            ? (sharedContext.permission === 'read' ? '#92400e' : '#1e40af')
            : '#111827',
          boxShadow: sharedContext 
            ? '0 2px 8px rgba(0,0,0,0.15)'
            : '0 1px 3px rgba(0,0,0,0.08)',
          borderBottom: sharedContext
            ? (sharedContext.permission === 'read' ? '2px solid #fbbf24' : '2px solid #3b82f6')
            : '1px solid #e5e7eb',
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: { xs: 1, sm: 2 },
              flexShrink: 0,
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f9fafb',
                color: '#111827',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexGrow: 1,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                flexShrink: 0,
              }}
            >
              <Image
                src="/logo.png"
                alt="WedLedger"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 600, 
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: { xs: '1rem', sm: '1.125rem' },
                color: '#111827',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {t('app.name')}
            </Typography>
            {user && (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: '#6b7280',
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  ml: { xs: 0, sm: 2 },
                }}
              >
                {t('app.hello').replace('{name}', getUserDisplayName())}
              </Typography>
            )}
          </Box>
          
          {sharedContext && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
              {sharedContext.permission === 'read' ? (
                <VisibilityIcon sx={{ color: '#92400e', fontSize: '1.25rem' }} />
              ) : (
                <EditIcon sx={{ color: '#1e40af', fontSize: '1.25rem' }} />
              )}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  color: sharedContext.permission === 'read' ? '#92400e' : '#1e40af',
                }}
              >
                {sharedContext.permission === 'read' 
                  ? t('app.viewMode') 
                  : t('app.editMode')}
              </Typography>
            </Box>
          )}
          
          {user?.id && (
            <Notifications userId={user.id} />
          )}
          
          <Button
            onClick={handleLanguageClick}
            startIcon={<LanguageIcon />}
            sx={{ 
              textTransform: 'none',
              minWidth: 'auto',
              px: { xs: 1, sm: 1.5 },
              color: '#6b7280',
              fontSize: '0.875rem',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#f9fafb',
                color: '#111827',
              },
              '& .MuiButton-startIcon': {
                marginRight: { xs: 0, sm: 0.5 },
                marginLeft: 0,
              },
            }}
          >
            <Box
              component="span"
              sx={{
                display: { xs: 'none', sm: 'inline' },
                whiteSpace: 'nowrap',
              }}
            >
              {language === 'he' ? 'עברית' : 'English'}
            </Box>
          </Button>
          
          <Menu
            anchorEl={langMenuAnchor}
            open={Boolean(langMenuAnchor)}
            onClose={handleLanguageClose}
          >
            <MenuItem onClick={() => handleLanguageChange('he')}>
              עברית (Hebrew)
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange('en')}>
              English
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        anchor={language === 'he' ? 'right' : 'left'}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
        }}
      >
        <Toolbar />
        {sharedContext && (
          <Alert
            severity={sharedContext.permission === 'read' ? 'warning' : 'info'}
            icon={sharedContext.permission === 'read' ? <VisibilityIcon /> : <EditIcon />}
            action={
              <Button
                variant="contained"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={() => {
                  clearSharedContext();
                  router.push('/dashboard');
                }}
                sx={{
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.5 },
                  backgroundColor: sharedContext.permission === 'read' 
                    ? '#f59e0b' 
                    : '#2563eb',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    backgroundColor: sharedContext.permission === 'read' 
                      ? '#d97706' 
                      : '#1d4ed8',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  },
                }}
              >
                {t('app.backToMyLedger')}
              </Button>
            }
            sx={{
              borderRadius: 0,
              backgroundColor: sharedContext.permission === 'read' 
                ? '#fef3c7' 
                : '#dbeafe',
              color: sharedContext.permission === 'read' 
                ? '#92400e' 
                : '#1e40af',
              borderBottom: sharedContext.permission === 'read'
                ? '1px solid #fbbf24'
                : '1px solid #3b82f6',
              '& .MuiAlert-icon': {
                color: sharedContext.permission === 'read' ? '#92400e' : '#1e40af',
              },
              '& .MuiAlert-message': {
                fontWeight: 500,
                flex: 1,
              },
            }}
          >
            <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
              {sharedContext.permission === 'read' 
                ? t('app.viewModeBanner').replace('{name}', sharedContext.childPhone)
                : t('app.editModeBanner').replace('{name}', sharedContext.childPhone)}
            </Typography>
          </Alert>
        )}
        {children}
      </Box>
    </Box>
  );
}
