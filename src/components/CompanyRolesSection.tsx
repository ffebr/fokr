import React, { useState, useEffect } from 'react';
import { Plus, ShieldMinus, Shield } from 'lucide-react';
import api from '../api/axios';

interface Role {
  name: string;
  description: string;
}

interface CompanyRolesSectionProps {
  companyId: string;
}

const CompanyRolesSection: React.FC<CompanyRolesSectionProps> = ({ companyId }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingRole, setCreatingRole] = useState(false);
  const [removingRole, setRemovingRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: ''
  });

  const fetchRoles = async () => {
    if (!companyId) return;
    
    try {
      const response = await api.get(`/companies/${companyId}/roles`);
      setRoles(response.data.roles || []);
    } catch (error: any) {
      console.error('Ошибка при загрузке ролей:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [companyId]);

  const handleCreateRole = async () => {
    if (!companyId || !newRole.name.trim()) return;
    
    setCreatingRole(true);
    try {
      await api.post(`/companies/${companyId}/roles`, {
        name: newRole.name,
        description: newRole.description
      });
      await fetchRoles();
      setNewRole({ name: '', description: '' });
    } catch (error: any) {
      console.error('Ошибка при создании роли:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setCreatingRole(false);
    }
  };

  const handleRemoveRole = async (roleName: string) => {
    if (!companyId || !confirm('Вы уверены, что хотите удалить эту роль?')) return;
    
    setRemovingRole(roleName);
    try {
      await api.delete(`/companies/${companyId}/roles/${roleName}`);
      await fetchRoles();
    } catch (error: any) {
      console.error('Ошибка при удалении роли:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setRemovingRole(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Создать роль</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-1">
              Название роли
            </label>
            <input
              id="roleName"
              type="text"
              placeholder="Введите название роли"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="roleDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Описание роли
            </label>
            <textarea
              id="roleDescription"
              placeholder="Введите описание роли"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={newRole.description}
              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
            />
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
            onClick={handleCreateRole}
            disabled={creatingRole || !newRole.name.trim()}
          >
            {creatingRole ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <Plus className="w-5 h-5 mr-2" />
            )}
            Создать роль
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Роли компании</h3>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : roles.length > 0 ? (
          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.name} className="p-4 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{role.name}</h4>
                  <button 
                    className="text-red-600 hover:text-red-700 flex items-center disabled:opacity-50"
                    onClick={() => handleRemoveRole(role.name)}
                    disabled={removingRole === role.name}
                  >
                    {removingRole === role.name ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mr-2"></div>
                    ) : (
                      <ShieldMinus className="w-5 h-5 mr-2" />
                    )}
                    Удалить
                  </button>
                </div>
                {role.description && (
                  <p className="text-sm text-gray-500 mb-4">{role.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Нет ролей в компании
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyRolesSection; 