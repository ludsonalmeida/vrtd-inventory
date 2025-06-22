import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} {...props} />;
});

const MyComponent = () => {
  return (
    <Snackbar
      open={true} // Force open for testing
      autoHideDuration={6000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity="info" sx={{ width: '100%' }}>
        Teste: Este é um alerta de teste para verificar o funcionamento do Snackbar.
      </Alert>
    </Snackbar>
  );
};

export default MyComponent;