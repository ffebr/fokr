import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, Plus, Search, X } from 'lucide-react';
import api from '../api/axios';

interface Role {
  name: string;
  description: string;
}

interface Team {
  _id: string;
  name: string;
  companyId: string;
  createdBy: string;
  requiredRoles: string[];
}

const TeamRolesPage: React.FC = () => {
  const { companyId, teamId } = useParams<{ companyId: string; teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [companyRoles, setCompanyRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [removingRoles, setRemovingRoles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Role[]>([]);
  const [addingRoles, setAddingRoles] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const fetchTeamAndRoles = async () => {
    if (!teamId) return;
    
    setLoading(true);
    try {
      const [teamResponse, rolesResponse] = await Promise.all([
        api.get(`/teams/${teamId}`),
        api.get(`/companies/${companyId}/roles`)
      ]);
      
      setTeam(teamResponse.data);
      setCompanyRoles(rolesResponse.data.roles || []);
    } catch (error: any) {
      console.error('Ошибка при загрузке данных:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamAndRoles();
  }, [teamId, companyId]);

  const handleRoleToggle = (roleName: string) => {
    const newSelected = new Set(selectedRoles);
    if (newSelected.has(roleName)) {
      newSelected.delete(roleName);
    } else {
      newSelected.add(roleName);
    }
    setSelectedRoles(newSelected);
  };

  const handleRemoveRoles = async () => {
    if (!teamId || selectedRoles.size === 0) return;
    
    setRemovingRoles(true);
    try {
      await api.post(`/teams/${teamId}/roles/bulk-remove`, {
        roleNames: Array.from(selectedRoles)
      });
      await fetchTeamAndRoles();
      setSelectedRoles(new Set());
    } catch (error: any) {
      console.error('Ошибка при удалении ролей:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setRemovingRoles(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const availableRoles = companyRoles.filter(role => {
      // Проверяем, что роль не является уже назначенной
      if (team?.requiredRoles.includes(role.name)) return false;
      
      // Проверяем соответствие поисковому запросу
      return role.name.toLowerCase().includes(query) || 
             (role.description && role.description.toLowerCase().includes(query));
    });

    setSearchResults(availableRoles);
  };

  const handleSelectAll = () => {
    if (selectedRoles.size === searchResults.length) {
      // Если все роли уже выбраны, снимаем выбор со всех
      setSelectedRoles(new Set());
    } else {
      // Иначе выбираем все доступные роли
      setSelectedRoles(new Set(searchResults.map(role => role.name)));
    }
  };

  const handleAddRoles = async (roleNames: string[]) => {
    if (!teamId || roleNames.length === 0) return;
    
    setAddingRoles(true);
    try {
      await api.post(`/teams/${teamId}/roles/bulk`, {
        roles: roleNames
      });
      await fetchTeamAndRoles();
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedRoles(new Set());
    } catch (error: any) {
      console.error('Ошибка при добавлении ролей:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setAddingRoles(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Команда не найдена</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/companies/${companyId}/settings/teams`)}
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold">Управление ролями команды {team.name}</h1>
        </div>
        <button
          onClick={() => setShowSearch(true)}
          className="text-blue-600 hover:text-blue-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Добавить роли
        </button>
      </div>

      {showSearch && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Добавить роли</h3>
            <button 
              onClick={() => setShowSearch(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Поиск по названию или описанию"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch();
                  }}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="max-h-[40vh] overflow-y-auto mb-4">
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    id="select-all-roles"
                    checked={selectedRoles.size === searchResults.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <label 
                    htmlFor="select-all-roles"
                    className="flex-1 cursor-pointer font-medium"
                  >
                    Выбрать все ({searchResults.length})
                  </label>
                </div>
                {searchResults.map((role) => (
                  <div 
                    key={role.name}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      id={`search-role-${role.name}`}
                      checked={selectedRoles.has(role.name)}
                      onChange={() => handleRoleToggle(role.name)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <label 
                      htmlFor={`search-role-${role.name}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{role.name}</div>
                      {role.description && (
                        <div className="text-sm text-gray-500">{role.description}</div>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                {searchQuery ? 'Роли не найдены' : 'Введите запрос для поиска ролей'}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowSearch(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              onClick={() => handleAddRoles(Array.from(selectedRoles))}
              disabled={addingRoles || selectedRoles.size === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {addingRoles ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Добавление...
                </>
              ) : (
                `Добавить выбранные (${selectedRoles.size})`
              )}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Требуемые роли</h2>
            {selectedRoles.size > 0 && (
              <button
                onClick={handleRemoveRoles}
                disabled={removingRoles}
                className="text-red-600 hover:text-red-700 flex items-center disabled:opacity-50"
              >
                {removingRoles ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mr-2"></div>
                ) : (
                  <Trash2 className="w-5 h-5 mr-2" />
                )}
                Удалить выбранные ({selectedRoles.size})
              </button>
            )}
          </div>
        </div>

        <div className="divide-y">
          {team.requiredRoles.length > 0 ? (
            team.requiredRoles.map((roleName) => {
              const role = companyRoles.find(r => r.name === roleName);
              return (
                <div 
                  key={roleName}
                  className="flex items-center space-x-3 p-4 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    id={`role-${roleName}`}
                    checked={selectedRoles.has(roleName)}
                    onChange={() => handleRoleToggle(roleName)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <label 
                    htmlFor={`role-${roleName}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{roleName}</div>
                    {role?.description && (
                      <div className="text-sm text-gray-500">{role.description}</div>
                    )}
                  </label>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-500">
              Нет требуемых ролей
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamRolesPage; 