// pages/AdminPage.tsx

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import Button from '../components/ui/Button';
import { PencilSquareIcon, TrashIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import Modal from '../components/ui/Modal';
import TextInput from '../components/ui/TextInput';
import SelectInput from '../components/ui/SelectInput';

const userRoleOptions = Object.values(UserRole).map(role => ({ value: role, label: role }));

const AdminPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userForm, setUserForm] = useState<Partial<User>>({ role: UserRole.ENCARGADO });

    // 1. useEffect para cargar los usuarios desde la API al iniciar
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/users');
            if (!response.ok) throw new Error('Error al cargar usuarios');
            const data: User[] = await response.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
            alert('No se pudieron cargar los usuarios.');
        }
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setUserForm({ name: '', email: '', role: UserRole.READ_ONLY, unit: '' });
        setIsUserModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setUserForm({ ...user });
        setIsUserModalOpen(true);
    };

    // 2. Función de borrado conectada a la API
    const handleDeleteUser = async (userId: string) => {
        const userToDelete = users.find(u => u.id === userId);
        if (window.confirm(`¿Está seguro de que desea eliminar al usuario ${userToDelete?.name || userId}?`)) {
            try {
                const response = await fetch(`http://localhost:4000/api/users/${userId}`, { method: 'DELETE' });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al eliminar');
                }
                alert('Usuario eliminado exitosamente');
                fetchUsers(); // Recargamos la lista de usuarios
            } catch (error) {
                console.error(error);
                alert(`Error: ${error instanceof Error ? error.message : "Ocurrió un error"}`);
            }
        }
    };

    const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserForm(prev => ({ ...prev, [name]: value }));
    };

    // 3. Función de submit conectada a la API (para Crear y Editar)
    const handleUserFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingUser
            ? `http://localhost:4000/api/users/${editingUser.id}`
            : 'http://localhost:4000/api/users';

        const method = editingUser ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userForm),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar el usuario');
            }

            const successMessage = editingUser ? 'Usuario actualizado' : 'Usuario añadido';
            alert(`${successMessage} exitosamente`);
            fetchUsers(); // Recargamos la lista para ver los cambios

        } catch (error) {
            console.error("Error al guardar usuario:", error);
            alert(`Error: ${error instanceof Error ? error.message : "Ocurrió un error"}`);
        } finally {
            setIsUserModalOpen(false);
            setEditingUser(null);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-semibold text-gray-800">Panel de Administración</h1>

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
                        {users.map(user => (
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
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ... (La sección de Configuración del Sistema se queda igual) ... */}

            <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={editingUser ? "Editar Usuario" : "Añadir Nuevo Usuario"} size="md">
                <form onSubmit={handleUserFormSubmit} className="space-y-4">
                    <TextInput label="Nombre Completo" name="name" value={userForm.name || ''} onChange={handleUserFormChange} required />
                    <TextInput label="Dirección de Email" name="email" type="email" value={userForm.email || ''} onChange={handleUserFormChange} required />
                    <SelectInput label="Rol" name="role" options={userRoleOptions} value={userForm.role || ''} onChange={handleUserFormChange} required />
                    {userForm.role === UserRole.UNIT_MANAGER && (
                        <TextInput label="Unidad Asignada (Obligatorio para Jefe de Unidad)" name="unit" value={userForm.unit || ''} onChange={handleUserFormChange} placeholder="Ej: Genomics Unit" required={userForm.role === UserRole.UNIT_MANAGER} />
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