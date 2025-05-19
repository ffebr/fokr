import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart2, Users, Target, TrendingUp, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import api from '../api/axios';

interface KeyResultProgress {
  index: number;
  title: string;
  progress: number;
  actualValue: number;
  targetValue: number;
  metricType: string;
  unit: string;
  teams: string[];
}

interface ProgressHistory {
  date: string;
  value: number;
  keyResultsProgress: {
    index: number;
    value: number;
    _id: string;
  }[];
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
  isFrozen: boolean;
  deadline: string;
  progressHistory: ProgressHistory[];
  totalTeamOKRs: number;
  activeTeamOKRs: number;
  frozenTeamOKRs: number;
  involvedTeams: string[];
}

interface CompanyStats {
  companyId: string;
  totalOKRs: number;
  completedOKRs: number;
  atRiskOKRs: number;
  frozenOKRs: number;
  totalTeamOKRs: number;
  activeTeamOKRs: number;
  frozenTeamOKRs: number;
  stats: OKRStats[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CompanyStatisticsPage: React.FC = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null);

  useEffect(() => {
    const fetchCompanyStats = async () => {
      if (!companyId) return;

      try {
        const response = await api.get(`/companies/${companyId}/stats`);
        setCompanyStats(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке статистики компании:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyStats();
  }, [companyId]);

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

  const pieChartData = companyStats ? [
    { name: 'Завершены', value: companyStats.completedOKRs },
    { name: 'В процессе', value: companyStats.totalOKRs - companyStats.completedOKRs - companyStats.atRiskOKRs },
    { name: 'Под угрозой', value: companyStats.atRiskOKRs },
    { name: 'Заморожены', value: companyStats.frozenOKRs }
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
        <h1 className="text-2xl font-bold mb-2">Статистика компании</h1>
        <p className="text-sm text-gray-500">
          Общая статистика и показатели эффективности
        </p>
      </div>

      {companyStats && (
        <>
          {/* Общие показатели */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center text-gray-600 mb-4">
              <BarChart2 className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">Общие показатели</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500 mb-1">Всего OKR</div>
                <div className="text-2xl font-semibold">{companyStats.totalOKRs}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500 mb-1">Завершено</div>
                <div className="text-2xl font-semibold">{companyStats.completedOKRs}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500 mb-1">Под угрозой</div>
                <div className="text-2xl font-semibold">{companyStats.atRiskOKRs}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500 mb-1">Заморожено</div>
                <div className="text-2xl font-semibold">{companyStats.frozenOKRs}</div>
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center text-gray-600 mb-4">
              <Target className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">Прогресс по OKR</h2>
            </div>
            <div className="space-y-8">
              {companyStats.stats.map((stat) => (
                <div key={stat.okrId._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{stat.okrId.objective}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      stat.status === 'completed' ? 'bg-green-100 text-green-800' :
                      stat.status === 'at_risk' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {stat.status === 'completed' ? 'Завершен' :
                       stat.status === 'at_risk' ? 'Под угрозой' :
                       'В процессе'}
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

          {/* Тренды и аналитика */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center text-gray-600 mb-4">
              <TrendingUp className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">Тренды и аналитика</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500 mb-1">Всего командных OKR</div>
                <div className="text-2xl font-semibold">{companyStats.totalTeamOKRs}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500 mb-1">Активные командные OKR</div>
                <div className="text-2xl font-semibold">{companyStats.activeTeamOKRs}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CompanyStatisticsPage; 