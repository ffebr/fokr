import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, ShieldPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface User {
  _id: string;
  name: string;
  email: string;
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
  requiredRoles: string[];
  createdAt: string;
  updatedAt: string;
}

interface CompanyTeamsSectionProps {
  companyId: string;
}

const CompanyTeamsSection: React.FC<CompanyTeamsSectionProps> = ({ companyId }) => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: ''
  });
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [companyUsers, setCompanyUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [updatingMembers, setUpdatingMembers] = useState(false);

  const fetchTeams = async () => {
    if (!companyId) return;
    
    try {
      const response = await api.get(`/teams?companyId=${companyId}`);
      setTeams(response.data.teams);
    } catch (error: any) {
      console.error('Ошибка при загрузке команд:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [companyId]);

  const fetchCompanyUsers = async () => {
    if (!companyId) return;
    
    setLoadingUsers(true);
    try {
      const response = await api.get(`/users/company/${companyId}`);
      setCompanyUsers(response.data.users);
    } catch (error: any) {
      console.error('Ошибка при загрузке пользователей:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!companyId || !newTeam.name.trim()) return;
    
    setCreatingTeam(true);
    try {
      const response = await api.post('/teams', {
        name: newTeam.name,
        companyId: companyId,
        description: newTeam.description
      });
      await fetchTeams(); // Обновляем список команд
      setNewTeam({ name: '', description: '' }); // Очищаем форму
    } catch (error: any) {
      console.error('Ошибка при создании команды:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту команду?')) return;
    
    setDeletingTeam(teamId);
    try {
      await api.delete(`/teams/${teamId}`);
      await fetchTeams(); // Обновляем список команд после удаления
    } catch (error: any) {
      console.error('Ошибка при удалении команды:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setDeletingTeam(null);
    }
  };

  const handleManageMembers = (team: Team) => {
    navigate(`/companies/${companyId}/settings/teams/${team._id}/members`);
  };

  const handleManageRoles = (team: Team) => {
    navigate(`/companies/${companyId}/settings/teams/${team._id}/roles`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Создать команду</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
              Название команды
            </label>
            <input
              id="teamName"
              type="text"
              placeholder="Введите название команды"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Описание команды
            </label>
            <textarea
              id="teamDescription"
              placeholder="Введите описание команды"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={newTeam.description}
              onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
            />
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
            onClick={handleCreateTeam}
            disabled={creatingTeam || !newTeam.name.trim()}
          >
            {creatingTeam ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <Plus className="w-5 h-5 mr-2" />
            )}
            Создать команду
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Команды компании</h3>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : teams.length > 0 ? (
          <div className="space-y-4">
            {teams.map((team) => (
              <div key={team._id} className="p-4 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{team.name}</h4>
                  <button 
                    className="text-red-600 hover:text-red-700 flex items-center disabled:opacity-50"
                    onClick={() => handleDeleteTeam(team._id)}
                    disabled={deletingTeam === team._id}
                  >
                    {deletingTeam === team._id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mr-2"></div>
                    ) : (
                      <Trash2 className="w-5 h-5 mr-2" />
                    )}
                    Удалить
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Участников: {team.members.length}
                </p>
                <div className="flex items-center space-x-4">
                  <button 
                    className="text-blue-600 hover:text-blue-700 flex items-center"
                    onClick={() => handleManageMembers(team)}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Управление участниками
                  </button>
                  <button 
                    className="text-blue-600 hover:text-blue-700 flex items-center"
                    onClick={() => handleManageRoles(team)}
                  >
                    <ShieldPlus className="w-5 h-5 mr-2" />
                    Управление ролями
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Нет команд в компании
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyTeamsSection; 