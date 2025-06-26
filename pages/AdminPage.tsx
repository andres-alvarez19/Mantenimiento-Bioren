
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../constants'; // Import MOCK_USERS to be mutated
import Button from '../components/ui/Button';
import { PencilSquareIcon, TrashIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import Modal from '../components/ui/Modal';
import TextInput from '../components/ui/TextInput';
import SelectInput from '../components/ui/SelectInput';

const userRoleOptions = Object.values(UserRole).map(role => ({ value: role, label: role }));

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([...MOCK_USERS]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [newUserForm, setNewUserForm] = useState<Partial<User>>({role: UserRole.READ_ONLY});

  useEffect(() => {
    // Sync local state if MOCK_USERS is changed elsewhere (e.g. test environment)
    // or to ensure initial load always reflects the current MOCK_USERS
    setUsers([...MOCK_USERS]);
  }, [MOCK_USERS.length]); // Re-sync if a user is added/deleted externally affecting length


  const handleAddUser = () => {
    setEditingUser(null);
    setNewUserForm({name: '', email: '', role: UserRole.READ_ONLY, unit: ''});
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUserForm({...user});
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = MOCK_USERS.find(u => u.id === userId);
    if (window.confirm(`¿Está seguro de que desea eliminar el usuario ${userToDelete?.name || userId}?`)) {
      const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        MOCK_USERS.splice(userIndex, 1); 
      }
      setUsers([...MOCK_USERS]); 
      console.log(`Usuario eliminado: ${userId}`);
      alert(`Usuario ${userToDelete?.name || userId} eliminado.`);
    }
  };
  
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setNewUserForm(prev => ({...prev, [name]: value}));
  };

  const handleUserFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(editingUser) {
        const updatedUser = { ...editingUser, ...newUserForm } as User;
        const userIndex = MOCK_USERS.findIndex(u => u.id === editingUser.id);
        if (userIndex !== -1) {
            MOCK_USERS[userIndex] = updatedUser; 
        }
        setUsers([...MOCK_USERS]); 
        alert(`Usuario ${updatedUser.name} actualizado.`);
    } else {
        const fullNewUser: User = {
            id: `user-${Date.now()}`, 
            name: newUserForm.name || 'Nuevo Usuario',
            email: newUserForm.email || 'nuevo.usuario@example.com',
            role: newUserForm.role || UserRole.READ_ONLY,
            unit: newUserForm.role === UserRole.UNIT_MANAGER ? newUserForm.unit : undefined,
        };
        MOCK_USERS.push(fullNewUser); 
        setUsers([...MOCK_USERS]); 
        alert(`Usuario ${fullNewUser.name} añadido.`);
    }
    setIsUserModalOpen(false);
    setEditingUser(null);
  };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold text-gray-800">Panel de Administración</h1>

      {/* User Management Section */}
      <section className="bg-white p-6 shadow rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Gestión de Usuarios</h2>
          <Button onClick={handleAddUser} leftIcon={<UserPlusIcon className="w-5 h-5"/>}>Añadir Nuevo Usuario</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    No hay usuarios registrados. Puede añadir usuarios usando el botón de arriba.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.unit || 'N/D'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} title={`Editar ${user.name}`}><PencilSquareIcon className="w-5 h-5 text-yellow-600"/></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} title={`Eliminar ${user.name}`}><TrashIcon className="w-5 h-5 text-red-600"/></Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* System Settings Section (Placeholder) */}
      <section className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Configuración del Sistema</h2>
        <p className="text-gray-600">
          Esta sección incluiría típicamente configuraciones para alertas, políticas de mantenimiento, integraciones (ej., SMTP para email), etc.
          Para este prototipo, estas son configuraciones de ejemplo.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección de Email para Alertas (Remitente)</label>
            <input type="email" defaultValue="alertas@bioren.edu" className="mt-1 block w-full md:w-1/2 border-gray-300 rounded-md shadow-sm sm:text-sm" disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tiempo de Anticipación para Recordatorios de Mantenimiento (Semanas)</label>
            <input type="number" defaultValue="4" className="mt-1 block w-full md:w-1/4 border-gray-300 rounded-md shadow-sm sm:text-sm" disabled />
          </div>
          <Button variant="primary" disabled>Guardar Configuración (Deshabilitado)</Button>
        </div>
         <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700">
            <p className="font-bold">Nota del Desarrollador:</p>
            <p>La gestión de usuarios ahora modifica el array `MOCK_USERS` global para que los cambios persistan dentro de la sesión de la aplicación simulada. La configuración del sistema sigue siendo simulada y los cambios no se guardan.</p>
        </div>
      </section>

      {/* User Form Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={editingUser ? "Editar Usuario" : "Añadir Nuevo Usuario"} size="md">
        <form onSubmit={handleUserFormSubmit} className="space-y-4">
            <TextInput label="Nombre Completo" name="name" value={newUserForm.name || ''} onChange={handleUserFormChange} required />
            <TextInput label="Dirección de Email" name="email" type="email" value={newUserForm.email || ''} onChange={handleUserFormChange} required />
            <SelectInput label="Rol" name="role" options={userRoleOptions} value={newUserForm.role || ''} onChange={handleUserFormChange} required />
            {newUserForm.role === UserRole.UNIT_MANAGER && (
                <TextInput label="Unidad Asignada (Obligatorio para Jefe de Unidad)" name="unit" value={newUserForm.unit || ''} onChange={handleUserFormChange} placeholder="Ej: Genomics Unit" required={newUserForm.role === UserRole.UNIT_MANAGER} />
            )}
            <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setIsUserModalOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="primary">{editingUser ? "Guardar Cambios" : "Añadir Usuario"}</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPage;