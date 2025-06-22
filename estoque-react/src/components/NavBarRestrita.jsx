// src/components/NavBarRestrita.jsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StoreIcon from '@mui/icons-material/Store';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StraightenIcon from '@mui/icons-material/Straighten';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

export default function NavBarRestrita() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openCad, setOpenCad] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [anchorCad, setAnchorCad] = useState(null);
  const [anchorUser, setAnchorUser] = useState(null);
  const [anchorEstoque, setAnchorEstoque] = useState(null);
  const [anchorCmv, setAnchorCmv] = useState(null);

  if (!user) return null;

  const toggleDrawer = () => setDrawerOpen(prev => !prev);
  const handleCadOpen    = e => setAnchorCad(e.currentTarget);
  const handleCadClose   = () => setAnchorCad(null);
  const handleUserOpen   = e => setAnchorUser(e.currentTarget);
  const handleUserClose  = () => setAnchorUser(null);
  const handleEstoqueOpen = e => setAnchorEstoque(e.currentTarget);
  const handleEstoqueClose= () => setAnchorEstoque(null);
  const handleCmvOpen    = e => setAnchorCmv(e.currentTarget);
  const handleCmvClose   = () => setAnchorCmv(null);

  function handleLogout() {
    signOut();
    navigate('/login');
  }

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Reservas',   to: '/reservations', icon: <EventNoteIcon /> },
  ];

  const cadastroItems = [
    { label: 'Produtos',    to: '/products', icon: <StoreIcon /> },
    { label: 'Categorias',  to: '/categories', icon: <CategoryIcon /> },
    { label: 'Fornecedores',to: '/suppliers', icon: <LocalShippingIcon /> },
    { label: 'Unidades',    to: '/units', icon: <StraightenIcon /> },
  ];

  const userItems = [
    { label: 'Cadastrar Usuário', to: '/register', icon: <PersonAddIcon />, adminOnly: true },
    { label: 'Listar Usuários',   to: '/users',    icon: <PeopleIcon />,    adminOnly: true },
  ];

  const renderDesktopMenu = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
      {navItems.map(item => (
        <Button
          key={item.to}
          color="inherit"
          component={Link}
          to={item.to}
          startIcon={item.icon}
        >
          {item.label}
        </Button>
      ))}

      {/* Estoque Dropdown */}
      <Button
        color="inherit"
        onClick={handleEstoqueOpen}
        startIcon={<InventoryIcon />}
        endIcon={anchorEstoque ? <ExpandLess /> : <ExpandMore />}
      >
        Estoque
      </Button>
      <Menu
        anchorEl={anchorEstoque}
        open={Boolean(anchorEstoque)}
        onClose={handleEstoqueClose}
        keepMounted
      >
        <MenuItem
          component={Link}
          to="/estoque"
          onClick={handleEstoqueClose}
        >
          <ListItemIcon><InventoryIcon /></ListItemIcon>
          <ListItemText>Ver Estoque</ListItemText>
        </MenuItem>
        <MenuItem
          component={Link}
          to="/estoque?mode=add"
          onClick={handleEstoqueClose}
        >
          <ListItemIcon><AddIcon /></ListItemIcon>
          <ListItemText>Adicionar Estoque</ListItemText>
        </MenuItem>
      </Menu>

      {/* CMV Dropdown */}
      <Button
        color="inherit"
        onClick={handleCmvOpen}
        startIcon={<BarChartIcon />}
        endIcon={anchorCmv ? <ExpandLess /> : <ExpandMore />}
      >
        CMV
      </Button>
      <Menu
        anchorEl={anchorCmv}
        open={Boolean(anchorCmv)}
        onClose={handleCmvClose}
        keepMounted
      >
        <MenuItem
          component={Link}
          to="/cmv"
          onClick={handleCmvClose}
        >
          <ListItemIcon><BarChartIcon /></ListItemIcon>
          <ListItemText>Ver CMV</ListItemText>
        </MenuItem>
        <MenuItem
          component={Link}
          to="/estoque/movements"
          onClick={handleCmvClose}
        >
          <ListItemIcon><AddIcon /></ListItemIcon>
          <ListItemText>Adicionar Contagem</ListItemText>
        </MenuItem>
      </Menu>

      {/* Cadastros Dropdown */}
      <Button
        color="inherit"
        onClick={handleCadOpen}
        startIcon={<CategoryIcon />}
        endIcon={anchorCad ? <ExpandLess /> : <ExpandMore />}
      >
        Cadastros
      </Button>
      <Menu
        anchorEl={anchorCad}
        open={Boolean(anchorCad)}
        onClose={handleCadClose}
        keepMounted
      >
        {cadastroItems.map(item => (
          <MenuItem
            key={item.to}
            component={Link}
            to={item.to}
            onClick={handleCadClose}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Usuários (admin) */}
      {user.role === 'admin' && (
        <>
          <Button
            color="inherit"
            onClick={handleUserOpen}
            startIcon={<PeopleIcon />}
            endIcon={anchorUser ? <ExpandLess /> : <ExpandMore />}
          >
            Usuários
          </Button>
          <Menu
            anchorEl={anchorUser}
            open={Boolean(anchorUser)}
            onClose={handleUserClose}
            keepMounted
          >
            {userItems.map(item => (
              <MenuItem
                key={item.to}
                component={Link}
                to={item.to}
                onClick={handleUserClose}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText>{item.label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}

      <Button
        color="inherit"
        onClick={handleLogout}
        startIcon={<ExitToAppIcon />}
        sx={{ ml: 1 }}
      >
        Sair
      </Button>
    </Box>
  );

  const renderMobileDrawer = () => (
    <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
      <Box sx={{ width: 250 }} role="presentation">
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Link to="/dashboard">
            <img
              src="https://porks.nyc3.cdn.digitaloceanspaces.com/porkstoq-white.png"
              alt="PorkStoq"
              style={{ height: 40 }}
            />
          </Link>
        </Box>
        <Divider />
        <List>
          {navItems.map(item => (
            <ListItem button key={item.to} component={Link} to={item.to}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
          {/* Estoque Collapse */}
          <ListItem button onClick={() => setOpenCad(prev => !prev)}>
            {/* reuse openCad for simplicity */}
            <ListItemIcon><InventoryIcon /></ListItemIcon>
            <ListItemText primary="Estoque" />
            {openCad ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openCad} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button sx={{ pl: 4 }} component={Link} to="/estoque">
                <ListItemIcon><InventoryIcon /></ListItemIcon>
                <ListItemText primary="Ver Estoque" />
              </ListItem>
              <ListItem button sx={{ pl: 4 }} component={Link} to="/estoque?mode=add">
                <ListItemIcon><AddIcon /></ListItemIcon>
                <ListItemText primary="Adicionar Estoque" />
              </ListItem>
            </List>
          </Collapse>
          {/* CMV Collapse */}
          <ListItem button onClick={() => setOpenUser(prev => !prev)}>
            {/* reuse openUser for simplicity */}
            <ListItemIcon><BarChartIcon /></ListItemIcon>
            <ListItemText primary="CMV" />
            {openUser ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openUser} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button sx={{ pl: 4 }} component={Link} to="/cmv">
                <ListItemIcon><BarChartIcon /></ListItemIcon>
                <ListItemText primary="Ver CMV" />
              </ListItem>
              <ListItem button sx={{ pl: 4 }} component={Link} to="/stock/movements">
                <ListItemIcon><AddIcon /></ListItemIcon>
                <ListItemText primary="Adicionar Contagem" />
              </ListItem>
            </List>
          </Collapse>
          {/* Cadastros Collapse */}
          <ListItem button onClick={() => setOpenCad(prev => !prev)}>
            <ListItemIcon><CategoryIcon /></ListItemIcon>
            <ListItemText primary="Cadastros" />
            {openCad ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openCad} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {cadastroItems.map(item => (
                <ListItem
                  button
                  key={item.to}
                  sx={{ pl: 4 }}
                  component={Link}
                  to={item.to}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </List>
          </Collapse>
          {/* Usuários Collapse */}
          {user.role === 'admin' && (
            <>
              <ListItem button onClick={() => setOpenUser(prev => !prev)}>
                <ListItemIcon><PeopleIcon /></ListItemIcon>
                <ListItemText primary="Usuários" />
                {openUser ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={openUser} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {userItems.map(item => (
                    <ListItem
                      button
                      key={item.to}
                      sx={{ pl: 4 }}
                      component={Link}
                      to={item.to}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          )}
        </List>
        <Divider />
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><ExitToAppIcon /></ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          {!isDesktop && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Link to="/dashboard">
            <img
              src="https://porks.nyc3.cdn.digitaloceanspaces.com/porkstoq-white.png"
              alt="PorkStoq"
              style={{ height: 40 }}
            />
          </Link>
        </Box>

        {isDesktop ? renderDesktopMenu() : renderMobileDrawer()}
      </Toolbar>
    </AppBar>
  );
}
