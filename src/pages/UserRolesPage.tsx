import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, ShieldPlus, ShieldMinus } from 'lucide-react';
import api from '../api/axios';

interface Role {
  name: string;
  description: string;
  _id: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

const UserRolesPage: React.FC = () => {
  const { companyId, userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [companyRoles, setCompanyRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignedRoles, setSelectedAssignedRoles] = useState<string[]>([]);
  const [selectedAvailableRoles, setSelectedAvailableRoles] = useState<string[]>([]);
  const [addingRoles, setAddingRoles] = useState(false);
  const [removingRoles, setRemovingRoles] = useState(false);

  const fetchUserAndRoles = async () => {
    if (!companyId || !userId) return;

    try {
      const response = await api.get(`/companies/${companyId}`);
      const company = response.data;
      
      const userData = company.users.find((u: User) => u.id === userId);
      if (!userData) {
        throw new Error('User not found');
      }

      setUser(userData);
      setCompanyRoles(company.roles);
      setSelectedAssignedRoles([]);
      setSelectedAvailableRoles([]);
    } catch (error) {
      console.error('Error fetching user and roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndRoles();
  }, [companyId, userId]);

  const handleAssignedRoleToggle = (roleName: string) => {
    setSelectedAssignedRoles(prev => 
      prev.includes(roleName)
        ? prev.filter(r => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleAvailableRoleToggle = (roleName: string) => {
    setSelectedAvailableRoles(prev => 
      prev.includes(roleName)
        ? prev.filter(r => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleRemoveRoles = async () => {
    if (!companyId || !userId || !user || selectedAssignedRoles.length === 0) return;

    setRemovingRoles(true);
    try {
      await api.post(`/companies/${companyId}/users/${userId}/roles/bulk-remove`, {
        roles: selectedAssignedRoles
      });

      await fetchUserAndRoles();
    } catch (error) {
      console.error('Error removing roles:', error);
    } finally {
      setRemovingRoles(false);
    }
  };

  const handleAddRoles = async () => {
    if (!companyId || !userId || !user || selectedAvailableRoles.length === 0) return;

    setAddingRoles(true);
    try {
      await api.post(`/companies/${companyId}/users/${userId}/roles/bulk-assign`, {
        roles: selectedAvailableRoles
      });

      await fetchUserAndRoles();
    } catch (error) {
      console.error('Error adding roles:', error);
    } finally {
      setAddingRoles(false);
    }
  };

  const assignedRoles = companyRoles.filter(role => user?.roles.includes(role.name));
  const availableRoles = companyRoles.filter(role => !user?.roles.includes(role.name));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Пользователь не найден</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Управление ролями пользователя</h2>
          <p className="text-gray-500 mt-1">{user.name} ({user.email})</p>
        </div>
        <button
          onClick={() => navigate(`/companies/${companyId}/settings`)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Назад к настройкам
        </button>
      </div>

      {/* Список назначенных ролей */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Назначенные роли</h3>
          <button
            onClick={handleRemoveRoles}
            disabled={removingRoles || selectedAssignedRoles.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {removingRoles ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <ShieldMinus className="w-5 h-5 mr-2" />
            )}
            Удалить выбранные ({selectedAssignedRoles.length})
          </button>
        </div>
        <div className="space-y-4">
          {assignedRoles.map((role) => (
            <div
              key={role._id}
              className="p-4 border rounded-md hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedAssignedRoles.includes(role.name)}
                  onChange={() => handleAssignedRoleToggle(role.name)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <h4 className="font-medium">{role.name}</h4>
                  {role.description && (
                    <p className="text-sm text-gray-500">{role.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {assignedRoles.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              Нет назначенных ролей
            </div>
          )}
        </div>
      </div>

      {/* Список доступных ролей */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Доступные роли</h3>
          <button
            onClick={handleAddRoles}
            disabled={addingRoles || selectedAvailableRoles.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {addingRoles ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <ShieldPlus className="w-5 h-5 mr-2" />
            )}
            Добавить выбранные ({selectedAvailableRoles.length})
          </button>
        </div>
        <div className="space-y-4">
          {availableRoles.map((role) => (
            <div
              key={role._id}
              className="p-4 border rounded-md hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedAvailableRoles.includes(role.name)}
                  onChange={() => handleAvailableRoleToggle(role.name)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <h4 className="font-medium">{role.name}</h4>
                  {role.description && (
                    <p className="text-sm text-gray-500">{role.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {availableRoles.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              Нет доступных ролей
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRolesPage; 