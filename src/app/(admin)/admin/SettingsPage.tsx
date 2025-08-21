import React, { useState } from 'react';
import { Unit, Laboratory } from '@/types';
import { MOCK_UNITS, MOCK_LABS } from '@/lib/config/constants';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TextInput from '@/components/ui/TextInput';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';

// Reusable component for managing a list of items (Units or Labs)
const ManagementSection: React.FC<{
  title: string;
  items: Array<{ id: string; name: string }>;
  onAdd: () => void;
  onEdit: (item: { id: string; name: string }) => void;
  onDelete: (id: string) => void;
  itemType: 'Unit' | 'Laboratory';
}> = ({ title, items, onAdd, onEdit, onDelete, itemType }) => {
  return (
    <section className="bg-white p-6 shadow rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
        <Button onClick={onAdd} leftIcon={<PlusIcon className="w-5 h-5" />}>
          Add New {itemType}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(item)} title={`Edit ${itemType}`}>
                    <PencilSquareIcon className="w-5 h-5 text-yellow-600" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} title={`Delete ${itemType}`}>
                    <TrashIcon className="w-5 h-5 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
             {items.length === 0 && (
                <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">No items found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const SettingsPage: React.FC = () => {
    const [units, setUnits] = useState<Unit[]>(MOCK_UNITS);
    const [labs, setLabs] = useState<Laboratory[]>(MOCK_LABS);
    
    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'Unit' | 'Laboratory' | null>(null);
    const [editingItem, setEditingItem] = useState<{ id: string, name: string } | null>(null);
    const [itemName, setItemName] = useState('');

    // Delete confirmation modal states
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'Unit' | 'Laboratory' } | null>(null);

    const openModal = (type: 'Unit' | 'Laboratory', item: {id: string, name: string} | null = null) => {
        setModalType(type);
        if (item) {
            setEditingItem(item);
            setItemName(item.name);
        } else {
            setEditingItem(null);
            setItemName('');
        }
        setIsFormModalOpen(true);
    };

    const closeModal = () => {
        setIsFormModalOpen(false);
        setModalType(null);
        setEditingItem(null);
        setItemName('');
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemName.trim()) {
            alert('Name cannot be empty.');
            return;
        }

        if (modalType === 'Unit') {
            if (editingItem) {
                setUnits(units.map(u => u.id === editingItem.id ? { ...u, name: itemName } : u));
            } else {
                setUnits([...units, { id: `unit-${Date.now()}`, name: itemName }]);
            }
        } else if (modalType === 'Laboratory') {
            if (editingItem) {
                setLabs(labs.map(l => l.id === editingItem.id ? { ...l, name: itemName } : l));
            } else {
                setLabs([...labs, { id: `lab-${Date.now()}`, name: itemName }]);
            }
        }
        closeModal();
    };

    const openDeleteConfirm = (id: string, type: 'Unit' | 'Laboratory') => {
        setItemToDelete({ id, type });
        setIsConfirmModalOpen(true);
    };

    const closeDeleteConfirm = () => {
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        if (itemToDelete.type === 'Unit') {
            setUnits(units.filter(u => u.id !== itemToDelete.id));
        } else {
            setLabs(labs.filter(l => l.id !== itemToDelete.id));
        }
        closeDeleteConfirm();
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-semibold text-gray-800">System Settings</h1>

            <ManagementSection
                title="Manage Units"
                itemType="Unit"
                items={units}
                onAdd={() => openModal('Unit')}
                onEdit={(item) => openModal('Unit', item)}
                onDelete={(id) => openDeleteConfirm(id, 'Unit')}
            />

            <ManagementSection
                title="Manage Laboratories"
                itemType="Laboratory"
                items={labs}
                onAdd={() => openModal('Laboratory')}
                onEdit={(item) => openModal('Laboratory', item)}
                onDelete={(id) => openDeleteConfirm(id, 'Laboratory')}
            />

            {/* Form Modal for Add/Edit */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={closeModal}
                title={`${editingItem ? 'Edit' : 'Add'} ${modalType}`}
                size="md"
            >
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <TextInput
                        label={`${modalType} Name`}
                        id="itemName"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        required
                        autoFocus
                    />
                    <div className="flex justify-end space-x-2 pt-2">
                        <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button type="submit" variant="primary">{editingItem ? 'Save Changes' : `Add ${modalType}`}</Button>
                    </div>
                </form>
            </Modal>

            {/* Confirm Delete Modal */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={closeDeleteConfirm}
                title="Confirm Deletion"
                size="sm"
                footerActions={
                    <>
                        <Button variant="secondary" onClick={closeDeleteConfirm}>Cancel</Button>
                        <Button variant="danger" onClick={confirmDelete} className="ml-3">Delete</Button>
                    </>
                }
            >
                <p>Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.</p>
                <p className="text-sm text-gray-500 mt-2">Note: Deleting a unit/lab may affect existing equipment records that reference it. This is a simulated action.</p>
            </Modal>
        </div>
    );
};

export default SettingsPage;
