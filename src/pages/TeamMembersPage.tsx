import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, Plus, Search, X } from 'lucide-react';
import api from '../api/axios';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  _id: string;
}

interface Team {
  _id: string;
  name: string;
  companyId: string;
  createdBy: string;
  members: Array<{
    userId: string;
    _id: string;
  }>;
}

const TeamMembersPage: React.FC = () => {
  const { companyId, teamId } = useParams<{ companyId: string; teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [removingMembers, setRemovingMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingMembers, setAddingMembers] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [companyUsers, setCompanyUsers] = useState<User[]>([]);

  const fetchTeamAndMembers = async () => {
    if (!teamId) return;
    
    setLoading(true);
    try {
      const [teamResponse, membersResponse] = await Promise.all([
        api.get(`/teams/${teamId}`),
        api.get(`/teams/${teamId}/members`)
      ]);
      
      console.log('Team response:', teamResponse.data);
      console.log('Members response:', membersResponse.data);
      
      setTeam(teamResponse.data);
      
      // Обрабатываем участников из ответа команды
      if (teamResponse.data.members) {
        const formattedMembers = teamResponse.data.members.map((member: { 
          userId: { _id: string; name: string; email: string }; 
          _id: string 
        }) => ({
          id: member.userId._id,
          name: member.userId.name,
          email: member.userId.email,
          roles: [], // Если роли не приходят в ответе, устанавливаем пустой массив
          _id: member._id // Сохраняем оригинальный _id для удаления
        }));
        setMembers(formattedMembers);
      } else {
        console.error('No members found in team response');
        setMembers([]);
      }
    } catch (error: any) {
      console.error('Ошибка при загрузке данных:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyUsers = async () => {
    if (!companyId) return;
    
    try {
      const response = await api.get(`/companies/${companyId}/users`);
      setCompanyUsers(response.data.users || []);
    } catch (error: any) {
      console.error('Ошибка при загрузке пользователей компании:', error);
      setCompanyUsers([]);
    }
  };

  useEffect(() => {
    fetchTeamAndMembers();
    fetchCompanyUsers();
  }, [teamId, companyId]);

  const handleMemberToggle = (userId: string) => {
    const newSelected = new Set(selectedMembers);
    console.log('newSelected', newSelected);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    console.log('newSelected', newSelected);
    setSelectedMembers(newSelected);
    console.log('selectedMembers', selectedMembers);
  };

  const handleRemoveMembers = async () => {
    if (!teamId || selectedMembers.size === 0) return;
    
    setRemovingMembers(true);
    try {
      // Получаем _id выбранных участников
      const membersToRemove = members
        .filter(member => selectedMembers.has(member.id))
        .map(member => member._id);

      console.log('Removing members with IDs:', membersToRemove);

      await api.post(`/teams/${teamId}/users/bulk-remove`, {
        userIds: membersToRemove
      });
      await fetchTeamAndMembers();
      setSelectedMembers(new Set());
    } catch (error: any) {
      console.error('Ошибка при удалении участников:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setRemovingMembers(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const availableUsers = companyUsers.filter(user => {
      // Проверяем, что пользователь не является создателем команды
      if (user.id === team?.createdBy) return false;
      
      // Проверяем, что пользователь не является участником команды
      if (members.some(member => member.id === user.id)) return false;
      
      // Проверяем соответствие поисковому запросу
      return user.name.toLowerCase().includes(query) || 
             user.email.toLowerCase().includes(query);
    });

    setSearchResults(availableUsers);
  };

  const handleAddMembers = async (userIds: string[]) => {
    if (!teamId || userIds.length === 0) return;
    
    setAddingMembers(true);
    try {
      // Получаем полные объекты пользователей из searchResults по их ID
      const usersToAdd = searchResults.filter(user => userIds.includes(user.id));
      const userIdsToAdd = usersToAdd.map(user => user.id);

      console.log('Sending request with userIds:', userIdsToAdd);

      await api.post(`/teams/${teamId}/users/bulk`, {
        userIds: userIdsToAdd
      });
      await fetchTeamAndMembers();
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedMembers(new Set());
    } catch (error: any) {
      console.error('Ошибка при добавлении участников:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        data: error.config?.data
      });
    } finally {
      setAddingMembers(false);
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
          <h1 className="text-2xl font-semibold">Управление участниками команды {team.name}</h1>
        </div>
        <button
          onClick={() => setShowSearch(true)}
          className="text-blue-600 hover:text-blue-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Добавить участников
        </button>
      </div>

      {showSearch && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Добавить участников</h3>
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
                  placeholder="Поиск по имени или email"
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
                {searchResults.map((user) => (
                  <div 
                    key={user.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      id={`search-user-${user.id}`}
                      checked={selectedMembers.has(user.id)}
                      onChange={() => handleMemberToggle(user.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <label 
                      htmlFor={`search-user-${user.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                {searchQuery ? 'Пользователи не найдены' : 'Введите запрос для поиска пользователей'}
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
              onClick={() => handleAddMembers(Array.from(selectedMembers))}
              disabled={addingMembers || selectedMembers.size === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {addingMembers ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Добавление...
                </>
              ) : (
                'Добавить выбранных'
              )}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Участники команды</h2>
            {selectedMembers.size > 0 && (
              <button
                onClick={handleRemoveMembers}
                disabled={removingMembers}
                className="text-red-600 hover:text-red-700 flex items-center disabled:opacity-50"
              >
                {removingMembers ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mr-2"></div>
                ) : (
                  <Trash2 className="w-5 h-5 mr-2" />
                )}
                Удалить выбранных ({selectedMembers.size})
              </button>
            )}
          </div>
        </div>

        <div className="divide-y">
          {members.length > 0 ? (
            members.map((member) => (
              <div 
                key={member.id}
                className="flex items-center space-x-3 p-4 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  id={`member-${member.id}`}
                  checked={selectedMembers.has(member.id)}
                  onChange={() => handleMemberToggle(member.id)}
                  disabled={member.id === team.createdBy}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label 
                  htmlFor={`member-${member.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </label>
                {member.id === team.createdBy && (
                  <span className="text-sm text-gray-500">(Создатель команды)</span>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              Нет участников в команде
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMembersPage; 