import { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { List, ListItem, ListItemButton, ListItemText, Button, Box, Typography, Alert, Stack } from '@mui/material';

export type Employee = {
  id: number;
  name: string;
  address: string;
  phone_number: string;
  government_id: string;
  previous_experience: any[];
  salary_history: any[];
  current_position_details: string;
};

export default function EmployeeList({ onSelect, onCreate }: { onSelect: (id: number) => void, onCreate: () => void }) {
  const { role, logout, token } = useContext(AuthContext) as any;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    axios.get('/api/employees', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setEmployees(res.data))
      .catch(() => setError('Failed to load employees'));
  }, [token]);

  const handleDownload = () => {
    window.open('/api/employees/pdf', '_blank');
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Typography variant="h5" flexGrow={1}>Employees</Typography>
        <Button onClick={logout} variant="outlined">Logout</Button>
        {role === 'edit' && <Button onClick={onCreate} variant="contained">Add Employee</Button>}
        <Button onClick={handleDownload} variant="outlined">Download PDF</Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      <List>
        {employees.map(emp => (
          <ListItem key={emp.id} disablePadding>
            <ListItemButton onClick={() => onSelect(emp.id)}>
              <ListItemText primary={emp.name} secondary={emp.current_position_details} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
