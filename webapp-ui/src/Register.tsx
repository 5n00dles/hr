import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Box, Typography, Alert, Stack, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

export default function Register({ onBack }: { onBack: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('view');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      await axios.post('/api/users', { username, password, role });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 350, mx: 'auto', mt: 8 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Register</Typography>
        <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
        <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <FormControl>
          <InputLabel>Role</InputLabel>
          <Select value={role} label="Role" onChange={e => setRole(e.target.value)}>
            <MenuItem value="view">View</MenuItem>
            <MenuItem value="edit">Edit</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained">Register</Button>
        <Button onClick={onBack}>Back to Login</Button>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Registration successful! You can now log in.</Alert>}
      </Stack>
    </Box>
  );
}
