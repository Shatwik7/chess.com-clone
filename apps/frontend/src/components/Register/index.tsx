import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box
} from '@mui/material';

const Register: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const url = isLogin ? 'http://localhost:3000/login' : 'http://localhost:3000/register';
      const response = await axios.post(
        url,
        { username, password },
        { withCredentials: true }
      );
      Cookies.set('userToken', response.data.userToken, { expires: 1 });
      console.log('userToken :', response.data.userToken);

      if (isLogin) {
        Cookies.set('userId', response.data.userId, { expires: 1 });
      }

      onClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isLogin ? 'Login' : 'Register'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleFormSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsLogin(!isLogin)} color="primary">
          {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
        </Button>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Register;
