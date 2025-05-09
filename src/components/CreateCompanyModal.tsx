import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await api.post('/companies', { name: newName });
      setNewName('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setCreateError(err.response?.data?.message || 'Ошибка создания компании');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Новая компания</h2>
        {createError && <p className="text-red-600 mb-2">{createError}</p>}
        <form onSubmit={handleCreate}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Название компании</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={creating}
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${creating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {creating ? 'Создаем...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCompanyModal; 