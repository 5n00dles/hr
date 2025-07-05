import { useContext, useState } from 'react';
import { AuthProvider, AuthContext } from './AuthContext';
import Login from './Login';
import Register from './Register';
import EmployeeList from './EmployeeList';
import EmployeeDetail from './EmployeeDetail';
import EmployeeForm from './EmployeeForm';
import './App.css';

function MainApp() {
  const { token } = useContext(AuthContext) as any;
  const [showRegister, setShowRegister] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editEmp, setEditEmp] = useState<any>(null);

  if (!token) {
    return showRegister ? (
      <Register onBack={() => setShowRegister(false)} />
    ) : (
      <Login onRegister={() => setShowRegister(true)} />
    );
  }

  if (showForm) {
    return (
      <EmployeeForm
        employee={editEmp}
        onSave={async (emp) => {
          const method = editEmp ? 'PUT' : 'POST';
          const url = editEmp ? `/api/employees/${editEmp.id}` : '/api/employees';
          await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(emp)
          });
          setShowForm(false);
          setEditEmp(null);
        }}
        onCancel={() => { setShowForm(false); setEditEmp(null); }}
      />
    );
  }

  if (selectedEmp) {
    return (
      <EmployeeDetail
        id={selectedEmp}
        onBack={() => setSelectedEmp(null)}
        onEdit={() => {
          setEditEmp({ id: selectedEmp });
          setShowForm(true);
        }}
      />
    );
  }

  return (
    <EmployeeList
      onSelect={id => setSelectedEmp(id)}
      onCreate={() => { setEditEmp(null); setShowForm(true); }}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
