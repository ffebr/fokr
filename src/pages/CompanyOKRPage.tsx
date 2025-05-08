import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, Edit2, Target, MoreVertical } from 'lucide-react';
import api from '../api/axios';

interface KeyResult {
  title: string;
  description: string;
  teams: string[];
  progress: number;
}

interface Objective {
  _id: string;
  objective: string;
  description: string;
  keyResults: KeyResult[];
  progress: number;
  status: string;
  company: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
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

const OKRCard: React.FC<{ objective: Objective; teams: Team[] }> = ({ objective, teams }) => {
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активный';
      case 'done':
        return 'Завершен';
      case 'draft':
        return 'Черновик';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{objective.objective}</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(objective.status)}`}>
            {getStatusText(objective.status)}
          </span>
          <div className="relative">
            <button
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
            
            {isStatusMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => setIsStatusMenuOpen(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => setIsStatusMenuOpen(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {objective.description && (
        <p className="text-gray-600 text-sm mb-4">{objective.description}</p>
      )}

      <div className="space-y-3">
        {objective.keyResults.map((kr, index) => (
          <div key={index} className="bg-gray-50 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{kr.title}</span>
              <span className="text-sm text-gray-600">{kr.progress}%</span>
            </div>
            {kr.description && (
              <p className="text-sm text-gray-600 mb-2">{kr.description}</p>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${kr.progress}%` }}
              ></div>
            </div>
            {kr.teams.length > 0 && (
              <div className="text-sm text-gray-500 mt-2">
                Команды: {kr.teams.map(teamId => 
                  teams.find(t => t._id === teamId)?.name
                ).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Общий прогресс</span>
          <span className="text-sm font-medium">{objective.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-green-600 h-2 rounded-full"
            style={{ width: `${objective.progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const CompanyOKRPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newObjective, setNewObjective] = useState<{
    objective: string;
    description: string;
    keyResults: Array<{
      title: string;
      description: string;
      teams: string[];
    }>;
  }>({
    objective: '',
    description: '',
    keyResults: [{ title: '', description: '', teams: [] }]
  });

  useEffect(() => {
    fetchObjectives();
    fetchTeams();
  }, [companyId]);

  const fetchObjectives = async () => {
    try {
      const response = await api.get(`/companies/${companyId}/corporate-okrs`);
      setObjectives(response.data.corporateOKRs);
    } catch (error) {
      console.error('Ошибка при загрузке OKR:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams', {
        params: { companyId }
      });
      setTeams(response.data.teams);
    } catch (error) {
      console.error('Ошибка при загрузке команд:', error);
    }
  };

  const handleCreateObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/companies/${companyId}/corporate-okrs`, newObjective);
      setShowCreateForm(false);
      setNewObjective({
        objective: '',
        description: '',
        keyResults: [{ title: '', description: '', teams: [] }]
      });
      fetchObjectives();
    } catch (error) {
      console.error('Ошибка при создании OKR:', error);
    }
  };

  const handleAddKeyResult = () => {
    setNewObjective(prev => ({
      ...prev,
      keyResults: [...prev.keyResults, { title: '', description: '', teams: [] }]
    }));
  };

  const handleRemoveKeyResult = (index: number) => {
    setNewObjective(prev => ({
      ...prev,
      keyResults: prev.keyResults.filter((_, i) => i !== index)
    }));
  };

  const handleKeyResultChange = (index: number, field: string, value: string | string[] | boolean) => {
    setNewObjective(prev => ({
      ...prev,
      keyResults: prev.keyResults.map((kr, i) => 
        i === index ? { ...kr, [field]: value } : kr
      )
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">OKR компании</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Создать OKR
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Создать новый OKR</h2>
          <form onSubmit={handleCreateObjective} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Цель</label>
              <input
                type="text"
                value={newObjective.objective}
                onChange={(e) => setNewObjective(prev => ({ ...prev, objective: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Описание</label>
              <textarea
                value={newObjective.description}
                onChange={(e) => setNewObjective(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Ключевые результаты</h3>
                <button
                  type="button"
                  onClick={handleAddKeyResult}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {newObjective.keyResults.map((kr, index) => (
                <div key={index} className="border rounded-md p-4 space-y-4">
                  <div className="flex justify-between">
                    <h4 className="font-medium">KR {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyResult(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Название</label>
                    <input
                      type="text"
                      value={kr.title}
                      onChange={(e) => handleKeyResultChange(index, 'title', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Описание</label>
                    <textarea
                      value={kr.description}
                      onChange={(e) => handleKeyResultChange(index, 'description', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows={2}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Команды</label>
                    <div className="mt-2 max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
                      {teams.map(team => (
                        <label key={team._id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={kr.teams.includes(team._id)}
                            onChange={(e) => {
                              const newTeams = e.target.checked
                                ? [...kr.teams, team._id]
                                : kr.teams.filter(id => id !== team._id);
                              handleKeyResultChange(index, 'teams', newTeams);
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{team.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Создать
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : objectives.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {objectives.map((objective) => (
            <OKRCard 
              key={objective._id} 
              objective={objective}
              teams={teams}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          Нет созданных OKR
        </div>
      )}
    </div>
  );
};

export default CompanyOKRPage; 