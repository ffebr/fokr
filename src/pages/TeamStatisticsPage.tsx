import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, BarChart2, Target, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import api from '../api/axios';

interface Team {
  _id: string;
  name: string;
  description: string;
  requiredRoles: string[];
  members: { userId: string }[];
}

interface KeyResultProgress {
  index: number;
  title: string;
  progress: number;
  actualValue: number;
  targetValue: number;
  metricType: string;
  unit: string;
}

interface KeyResultHistory {
  index: number;
  value: number;
  _id: string;
}

interface ProgressHistory {
  date: string;
  value: number;
  keyResultsProgress: KeyResultHistory[];
  _id: string;
}

interface OKRStats {
  okrId: {
    _id: string;
    objective: string;
    description: string;
    deadline: string;
    isFrozen: boolean;
    keyResults: KeyResultProgress[];
    progress: number;
  };
  progress: number;
  status: 'on_track' | 'at_risk' | 'completed';
  keyResultsProgress: KeyResultProgress[];
  totalCheckIns: number;
  checkInFrequency?: number;
  isFrozen: boolean;
  deadline: string;
  progressHistory: ProgressHistory[];
}

interface TeamStats {
  teamId: string;
  totalOKRs: number;
  completedOKRs: number;
  atRiskOKRs: number;
  frozenOKRs: number;
  stats: OKRStats[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const TeamStatisticsPage: React.FC = () => {
  const { companyId, teamId } = useParams();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>(teamId || '');
  const [loading, setLoading] = useState(true);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!companyId) {
        console.error('Требуется ID компании');
        setTeams([]);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/teams?companyId=${companyId}`);
        const teamsData = response.data.teams || [];
        setTeams(teamsData);
      } catch (error) {
        console.error('Ошибка при загрузке команд:', error);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [companyId]);

  useEffect(() => {
    const fetchTeamStats = async () => {
      if (!selectedTeam) return;

      try {
        const response = await api.get(`/teams/${selectedTeam}/stats`);
        setTeamStats(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке статистики команды:', error);
      }
    };

    fetchTeamStats();
  }, [selectedTeam]);

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId);
    navigate(`/companies/${companyId}/statistics/team/${teamId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'at_risk': return 'bg-red-100 text-red-800';
      case 'on_track': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'at_risk': return 'Под угрозой';
      case 'on_track': return 'В процессе';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const pieChartData = teamStats ? [
    { name: 'Завершены', value: teamStats.completedOKRs },
    { name: 'В процессе', value: teamStats.totalOKRs - teamStats.completedOKRs - teamStats.atRiskOKRs },
    { name: 'Под угрозой', value: teamStats.atRiskOKRs },
    { name: 'Заморожены', value: teamStats.frozenOKRs }
  ] : [];

  return (
    <div className="p-6">
      <div className="mb-8">
        <button
          onClick={() => navigate(`/companies/${companyId}/statistics`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Назад
        </button>
        <h1 className="text-2xl font-bold mb-2">Статистика команды</h1>
        <p className="text-sm text-gray-500">
          Выберите команду для просмотра статистики
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center text-gray-600 mb-4">
          <Users className="w-5 h-5 mr-2" />
          <h2 className="text-lg font-semibold">Выбор команды</h2>
        </div>
        
        <select 
          value={selectedTeam} 
          onChange={(e) => handleTeamSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Выберите команду</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {selectedTeam && teamStats && (
        <div className="space-y-6">
          {/* Общая статистика */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center text-gray-600 mb-4">
              <BarChart2 className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">Общая статистика</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500 mb-1">Всего OKR</div>
                <div className="text-2xl font-semibold">{teamStats.totalOKRs}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500 mb-1">Завершено</div>
                <div className="text-2xl font-semibold">{teamStats.completedOKRs}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500 mb-1">Под угрозой</div>
                <div className="text-2xl font-semibold">{teamStats.atRiskOKRs}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500 mb-1">Заморожено</div>
                <div className="text-2xl font-semibold">{teamStats.frozenOKRs}</div>
              </div>
            </div>

            {/* График распределения OKR */}
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Прогресс по OKR */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center text-gray-600 mb-4">
              <Target className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">Прогресс по OKR</h2>
            </div>
            <div className="space-y-8">
              {teamStats.stats.map((stat) => (
                <div key={stat.okrId._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{stat.okrId.objective}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(stat.status)}`}>
                      {getStatusText(stat.status)}
                    </span>
                  </div>
                  
                  {/* График динамики прогресса */}
                  <div className="mb-4 h-48">
                    {stat.progressHistory && stat.progressHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={stat.progressHistory.map(history => ({
                            date: history.date,
                            total: history.value
                          }))}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={formatDate}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`${value}%`, 'Прогресс']}
                            labelFormatter={formatDate}
                          />
                          <Line
                            type="monotone"
                            dataKey="total"
                            name="Общий прогресс"
                            stroke="#8884d8"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Нет данных о динамике прогресса
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Текущий прогресс</span>
                      <span>{stat.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${stat.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {stat.keyResultsProgress.map((kr) => (
                      <div key={kr.index} className="text-sm">
                        <div className="flex justify-between text-gray-600 mb-1">
                          <span>{kr.title}</span>
                          <span>{kr.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${kr.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Активность участников */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center text-gray-600 mb-4">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">Активность участников</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={teamStats.stats.map(stat => ({
                    name: stat.okrId.objective,
                    checkIns: stat.totalCheckIns,
                    frequency: (stat.checkInFrequency || 0 * 100).toFixed(2)
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="checkIns" fill="#8884d8" name="Количество чек-инов" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamStatisticsPage; 