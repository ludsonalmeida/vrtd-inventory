// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { StockProvider } from './contexts/StockContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { UnitProvider } from './contexts/UnitContext';
import { SupplierProvider } from './contexts/SupplierContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import { ProductProvider } from './contexts/ProductContext';
import { StockMovementsProvider } from './contexts/StockMovementsContext'



const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffc107',
      contrastText: '#000',
    },
    secondary: {
      main: '#e53935',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#fff',
      secondary: '#ddd',
    },
  },
  typography: {
    fontFamily: ['"Comfortaa"', 'sans-serif'].join(','),
    h1: {
      fontFamily: ['"Alfa Slab One"'].join(','),
      fontWeight: 400,
      fontSize: '3rem',
    },
    h2: {
      fontFamily: ['"Alfa Slab One"'].join(','),
      fontWeight: 400,
      fontSize: '2.5rem',
    },
    h3: {
      fontFamily: ['"Alfa Slab One"'].join(','),
      fontWeight: 400,
      fontSize: '2rem',
    },
    h4: {
      fontFamily: ['"Alfa Slab One"'].join(','),
      fontWeight: 400,
      fontSize: '1.75rem',
    },
    h5: {
      fontFamily: ['"Alfa Slab One"'].join(','),
      fontWeight: 400,
      fontSize: '1.5rem',
    },
    h6: {
      fontFamily: ['"Alfa Slab One"'].join(','),
      fontWeight: 400,
      fontSize: '1.25rem',
    },
    button: {
      fontFamily: ['"Comfortaa"', 'sans-serif'].join(','),
      fontWeight: 700,
      textTransform: 'none',
    },
    subtitle1: {
      fontFamily: ['"Comfortaa"', 'sans-serif'].join(','),
    },
    subtitle2: {
      fontFamily: ['"Comfortaa"', 'sans-serif'].join(','),
    },
    body1: {
      fontFamily: ['"Comfortaa"', 'sans-serif'].join(','),
    },
    body2: {
      fontFamily: ['"Comfortaa"', 'sans-serif'].join(','),
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        InputLabelProps: {
          shrink: true,
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: '#ffffff',       // define cor branca para todos os SvgIcon
        },
      },
    },
    MuiOutlinedInput: {
      defaultProps: {
        notched: true,
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: '#1f1f1f',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#000',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <UnitProvider>
          <CategoryProvider>
            <StockProvider>
              <StockMovementsProvider>
                <SupplierProvider>
                  <ProductProvider>
                    <AppRoutes />
                  </ProductProvider>
                </SupplierProvider>
              </StockMovementsProvider>
            </StockProvider>
          </CategoryProvider>
        </UnitProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
