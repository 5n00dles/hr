import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { Button, TextField, Box, Typography, Alert, Stack } from '@mui/material';

export default function Login({ onRegister }: { onRegister: () => void }) {
  const { login } = useContext(AuthContext) as any;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/login', { username, password });
      login(res.data.access_token, res.data.role);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 350, mx: 'auto', mt: 8 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Login</Typography>
        <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
        <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <Button type="submit" variant="contained">Login</Button>
        <Button onClick={onRegister}>Register</Button>
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Box>
  );
}
