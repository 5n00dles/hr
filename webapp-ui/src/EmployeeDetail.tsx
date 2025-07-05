import { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { Box, Typography, Button, Stack, List, ListItem, ListItemText } from '@mui/material';
import type { Employee } from './EmployeeList';

export default function EmployeeDetail({ id, onBack, onEdit }: { id: number, onBack: () => void, onEdit: () => void }) {
  const { role } = useContext(AuthContext) as any;
  const [emp, setEmp] = useState<Employee | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/employees/${id}`)
      .then(res => setEmp(res.data))
      .catch(() => setError('Failed to load employee'));
  }, [id]);

  const handleDownload = () => {
    window.open(`/api/employees/${id}/pdf`, '_blank');
  };

  if (!emp) return <Box sx={{ mt: 4 }}>{error || 'Loading...'}</Box>;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Button onClick={onBack} sx={{ mb: 2 }}>Back</Button>
      <Typography variant="h5">{emp.name}</Typography>
      <Typography><b>Address:</b> {emp.address}</Typography>
      <Typography><b>Phone:</b> {emp.phone_number}</Typography>
      <Typography><b>Government ID:</b> {emp.government_id}</Typography>
      <Typography><b>Current Position:</b> {emp.current_position_details}</Typography>
      <Box mt={2}>
        <Typography><b>Previous Experience:</b></Typography>
        <List>
          {emp.previous_experience.map((exp, i) => (
            <ListItem key={i}>
              <ListItemText primary={`${exp.company} - ${exp.position} (${exp.years} years)`} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box mt={2}>
        <Typography><b>Salary History:</b></Typography>
        <List>
          {emp.salary_history.map((sal, i) => (
            <ListItem key={i}>
              <ListItemText primary={`${sal.year}: ${sal.salary} ${sal.currency} (${sal.position})`} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Stack direction="row" spacing={2} mt={2}>
        <Button onClick={handleDownload} variant="outlined">Download PDF</Button>
        {role === 'edit' && <Button onClick={onEdit} variant="contained">Edit</Button>}
      </Stack>
    </Box>
  );
}
