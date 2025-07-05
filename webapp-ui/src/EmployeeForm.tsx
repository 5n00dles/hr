import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Stack, Alert } from '@mui/material';
import type { Employee } from './EmployeeList';

function emptyEmployee(): Omit<Employee, 'id'> {
  return {
    name: '',
    address: '',
    phone_number: '',
    government_id: '',
    previous_experience: [],
    salary_history: [],
    current_position_details: ''
  };
}

export default function EmployeeForm({ employee, onSave, onCancel }: {
  employee?: Employee,
  onSave: (emp: Omit<Employee, 'id'>) => void,
  onCancel: () => void
}) {
  const [form, setForm] = useState<Omit<Employee, 'id'>>(employee ? { ...employee } : emptyEmployee());
  const [error] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Box component="form" onSubmit={e => { e.preventDefault(); onSave(form); }} sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h5">{employee ? 'Edit' : 'Add'} Employee</Typography>
        <TextField name="name" label="Name" value={form.name} onChange={handleChange} required />
        <TextField name="address" label="Address" value={form.address} onChange={handleChange} />
        <TextField name="phone_number" label="Phone Number" value={form.phone_number} onChange={handleChange} />
        <TextField name="government_id" label="Government ID" value={form.government_id} onChange={handleChange} />
        <TextField name="current_position_details" label="Current Position Details" value={form.current_position_details} onChange={handleChange} />
        <TextField name="previous_experience" label="Previous Experience (JSON)" value={JSON.stringify(form.previous_experience)} onChange={e => setForm({ ...form, previous_experience: JSON.parse(e.target.value) })} />
        <TextField name="salary_history" label="Salary History (JSON)" value={JSON.stringify(form.salary_history)} onChange={e => setForm({ ...form, salary_history: JSON.parse(e.target.value) })} />
        <Stack direction="row" spacing={2}>
          <Button type="submit" variant="contained">Save</Button>
          <Button type="button" onClick={onCancel}>Cancel</Button>
        </Stack>
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Box>
  );
}
