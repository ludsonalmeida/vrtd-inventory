// src/components/NavBarRestrita.jsx
import React from 'react';
import { AppBar, Toolbar, Box, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NavBarRestrita() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Se não houver usuário, não renderiza nada
  if (!user) {
    return null;
  }

  function handleLogout() {
    signOut();
    navigate('/login');
  }

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Caixa que cresce para "empurrar" os botões para a direita */}
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <img
              src="https://porks.nyc3.cdn.digitaloceanspaces.com/porkstoq-white.png"
              alt="PorkStoq"
              style={{ height: 40 }}
            />
          </Link>
        </Box>

        {/* Menu */}
        <Button color="inherit" component={Link} to="/dashboard">
          Dashboard
        </Button>
        <Button color="inherit" component={Link} to="/estoque">
          Estoque
        </Button>
        <Button color="inherit" component={Link} to="/categories">
          Categorias
        </Button>
        <Button color="inherit" component={Link} to="/suppliers">Fornecedores</Button>
        <Button color="inherit" component={Link} to="/units">
          Unidades
        </Button>
        {user.role === 'admin' && (
          <Button color="inherit" component={Link} to="/register">
            Cadastrar Usuário
          </Button>
        )}
        <Button color="inherit" onClick={handleLogout}>
          Sair
        </Button>
      </Toolbar>
    </AppBar>
  );
}
