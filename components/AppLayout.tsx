'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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

const DRAWER_WIDTH = 280;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);
  const { signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

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

  const menuItems = [
    {
      text: t('nav.myGifts'),
      icon: <CardGiftcardIcon />,
      path: '/dashboard',
    },
    {
      text: t('nav.analytics'),
      icon: <AnalyticsIcon />,
      path: '/analytics',
    },
    {
      text: t('nav.familyMembers'),
      icon: <PeopleIcon />,
      path: '/family',
    },
    {
      text: t('nav.eventTypes'),
      icon: <EventIcon />,
      path: '/event-types',
    },
    {
      text: t('nav.giftTypes'),
      icon: <CategoryIcon />,
      path: '/gift-types',
    },
  ];

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
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
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: pathname === item.path ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: pathname === item.path ? 600 : 400,
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
              borderRadius: 2,
              color: 'error.main',
            }}
          >
            <ListItemIcon sx={{ color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={t('nav.logout')} />
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
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, flexGrow: 1 }}>
            {t('app.name')}
          </Typography>
          
          <Button
            color="inherit"
            onClick={handleLanguageClick}
            startIcon={<LanguageIcon />}
            sx={{ textTransform: 'none' }}
          >
            {language === 'he' ? 'עברית' : 'English'}
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
        {children}
      </Box>
    </Box>
  );
}
