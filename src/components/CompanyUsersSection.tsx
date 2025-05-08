import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Search, Shield, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

// Интерфейс для пользователя из списка компании
interface CompanyUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

// Интерфейс для пользователя из поиска
interface SearchUser {
  id: string;
  name: string;
  email: string;
  roles: Array<{
    company: string;
    role: string;
  }>;
}

interface CompanyUsersSectionProps {
  companyId: string;
}

const CompanyUsersSection: React.FC<CompanyUsersSectionProps> = ({ companyId }) => {
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);
  const [removingUser, setRemovingUser] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCompanyUsers = async () => {
    if (!companyId) return;
    
    try {
      console.log('Fetching users for company:', companyId);
      const response = await api.get(`/companies/${companyId}/users`);
      console.log('API Response:', response);
      
      const userStr = localStorage.getItem('user');
      const currentUserId = userStr ? JSON.parse(userStr).id : null;
      console.log('Current user ID:', currentUserId);
      
      if (!response.data || !response.data.users) {
        console.error('No data in response');
        return;
      }

      const users = response.data.users.filter((user: CompanyUser) => user.id !== currentUserId);
      console.log('Filtered users:', users);
      
      setCompanyUsers(users);
    } catch (error: any) {
      console.error('Ошибка при загрузке пользователей компании:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setCompanyUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyUsers();
  }, [companyId]);

  const handleAddUser = async (user: SearchUser) => {
    if (!companyId) return;
    
    setAddingUser(true);
    try {
      await api.post(`/companies/${companyId}/users`, { userId: user.id });
      await fetchCompanyUsers(); // Обновляем список пользователей
      setSearchResults([]); // Очищаем результаты поиска
    } catch (error) {
      console.error('Ошибка при добавлении пользователя:', error);
    } finally {
      setAddingUser(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    console.log('Removing user:', userId);
    if (!companyId) return;
    
    setRemovingUser(userId);
    try {
      await api.delete(`/companies/${companyId}/users/${userId}`);
      await fetchCompanyUsers(); // Обновляем список пользователей
    } catch (error: any) {
      console.error('Ошибка при удалении пользователя:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setRemovingUser(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Добавить пользователя</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="Поиск по email"
                className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  const email = e.target.value;
                  if (email.length >= 3) {
                    api.get<SearchUser[]>(`/users/email/${email}`)
                      .then((response: { data: SearchUser[] }) => {
                        setSearchResults(response.data);
                      })
                      .catch((error: Error) => {
                        console.error('Ошибка при поиске пользователей:', error);
                        setSearchResults([]);
                      });
                  } else {
                    setSearchResults([]);
                  }
                }}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Результаты поиска */}
          {searchResults.length > 0 && (
            <div className="mt-4 border rounded-md divide-y">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => handleAddUser(user)}
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  {addingUser ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  ) : (
                    <UserPlus className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Пользователи компании</h3>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : companyUsers.length > 0 ? (
          <div className="space-y-4">
            {companyUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  {user.roles && user.roles.length > 0 && (
                    <div className="mt-1">
                      {user.roles.map((role, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate(`/companies/${companyId}/settings/users/${user.id}/roles`)}
                    className="text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Управление ролями
                  </button>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="text-red-600 hover:text-red-700 flex items-center"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Нет пользователей в компании
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyUsersSection; 