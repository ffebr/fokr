import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Plus, X } from 'lucide-react';
import api from '../api/axios';

interface KeyResult {
  title: string;
  description: string;
  progress: number;
  actualValue: number;
  unit: string;
  metricType: 'number' | 'percentage' | 'currency' | 'custom';
  startValue: number;
  targetValue: number;
}

interface OKR {
  _id: string;
  objective: string;
  description: string;
  keyResults: KeyResult[];
  progress: number;
  createdAt: string;
  updatedAt: string;
  isFrozen: boolean;
}

interface CheckInUpdate {
  index: number;
  previousProgress: number;
  newProgress: number;
}

interface CheckIn {
  _id: string;
  okr: string;
  user: string;
  comment: string;
  updates: CheckInUpdate[];
  createdAt: string;
  updatedAt: string;
}

interface CreateCheckInForm {
  okrId: string;
  updates: {
    index: number;
    newActualValue: number;
    newProgress: number;
  }[];
  comment: string;
}

interface Company {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  companies: Company[];
  createdAt: string;
  updatedAt: string;
}

const CreateCheckInModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: CreateCheckInForm) => void;
  okrId: string;
}> = ({ isOpen, onClose, onSubmit, okrId }) => {
  const [okr, setOkr] = useState<OKR | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateCheckInForm>({
    okrId: '',
    updates: [],
    comment: ''
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchOKR = async () => {
      if (!isOpen || !okrId) return;
      
      setLoading(true);
      try {
        const response = await api.get<OKR>(`/okrs/${okrId}`);
        setOkr(response.data);
        // Инициализируем форму с текущими значениями прогресса
        setForm({
          okrId,
          updates: response.data.keyResults.map((kr, index) => ({
            index,
            newActualValue: kr.actualValue,
            newProgress: kr.progress
          })),
          comment: ''
        });
      } catch (error) {
        console.error('Ошибка при загрузке OKR:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOKR();
  }, [isOpen, okrId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.comment.trim()) {
      setError('Пожалуйста, добавьте комментарий');
      return;
    }
    setError('');
    onSubmit(form);
  };

  const calculateProgress = (actualValue: number, startValue: number, targetValue: number, metricType: string) => {
    if (metricType === 'percentage') {
      const span = targetValue - startValue;
      const currentProgress = actualValue - startValue;
      return (currentProgress / span) * 100;
    }
    return ((actualValue - startValue) / (targetValue - startValue)) * 100;
  };

  const updateActualValue = (index: number, value: number) => {
    if (!okr) return;
    const kr = okr.keyResults[index];
    
    // Проверяем, что новое значение не меньше текущего
    if (value < kr.actualValue) {
      return; // Не позволяем уменьшать значение
    }
    
    // Для percentage типа ограничиваем значения от startValue до targetValue
    if (kr.metricType === 'percentage') {
      value = Math.max(kr.startValue, Math.min(kr.targetValue, value));
    }
    
    const newProgress = calculateProgress(value, kr.startValue, kr.targetValue, kr.metricType);
    
    setForm(prev => ({
      ...prev,
      updates: prev.updates.map((update, i) => 
        i === index ? { ...update, newActualValue: value, newProgress } : update
      )
    }));
  };

  const renderMetricInput = (kr: KeyResult, index: number) => {
    switch (kr.metricType) {
      case 'percentage':
        return (
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min={kr.startValue}
              max={kr.targetValue}
              value={form.updates[index].newActualValue}
              onChange={(e) => updateActualValue(index, parseInt(e.target.value))}
              className="flex-1"
            />
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={kr.startValue}
                max={kr.targetValue}
                value={form.updates[index].newActualValue}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    updateActualValue(index, value);
                  }
                }}
                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">%</span>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min={kr.actualValue}
              max={kr.targetValue}
              value={form.updates[index].newActualValue}
              onChange={(e) => updateActualValue(index, parseFloat(e.target.value))}
              className="flex-1"
            />
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={kr.actualValue}
                max={kr.targetValue}
                value={form.updates[index].newActualValue}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    updateActualValue(index, value);
                  }
                }}
                className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">{kr.unit}</span>
            </div>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!okr) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-500">Ошибка загрузки OKR</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Создать чек-ин</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Комментарий
            </label>
            <textarea
              value={form.comment}
              onChange={(e) => {
                setForm(prev => ({ ...prev, comment: e.target.value }));
                setError(''); // Очищаем ошибку при изменении
              }}
              className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              rows={3}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Обновления прогресса
              </label>
            </div>

            <div className="space-y-4">
              {okr.keyResults.map((kr, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-sm font-medium">{kr.title}</span>
                      {kr.description && (
                        <p className="text-sm text-gray-500 mt-1">{kr.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Текущее значение
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min={kr.startValue}
                        max={kr.targetValue}
                        value={form.updates[index].newActualValue}
                        onChange={(e) => updateActualValue(index, parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={kr.startValue}
                          max={kr.targetValue}
                          value={form.updates[index].newActualValue}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value)) {
                              updateActualValue(index, value);
                            }
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">{kr.unit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    <div>Текущее значение: {kr.actualValue} {kr.unit}</div>
                    <div>Текущий прогресс: {kr.progress}%</div>
                    {kr.metricType !== 'percentage' && (
                      <div>Диапазон: {kr.startValue} - {kr.targetValue} {kr.unit}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Создать чек-ин
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CheckInCardProps {
  checkIn: CheckIn;
  okr: OKR | null;
}

const CheckInCard: React.FC<CheckInCardProps> = ({ checkIn, okr }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get<User>(`/users/${checkIn.user}`);
        setUser(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [checkIn.user]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-gray-500" />
          {loading ? (
            <div className="animate-pulse h-4 w-32 bg-gray-200 rounded"></div>
          ) : user ? (
            <div>
              <span className="font-medium">{user.name}</span>
              <div className="text-sm text-gray-500">
                {user.email}
                {user.roles.length > 0 && (
                  <span className="ml-2">
                    ({user.roles.join(', ')})
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-gray-500">Пользователь не найден</span>
          )}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(checkIn.createdAt).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {checkIn.comment && (
        <p className="text-gray-600 mb-4">{checkIn.comment}</p>
      )}

      <div className="space-y-3">
        {checkIn.updates.map((update, index) => (
          <div key={index} className="bg-gray-50 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">
                {okr?.keyResults[update.index]?.title || `Ключевой результат ${update.index + 1}`}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {update.previousProgress}% →
                </span>
                <span className="text-sm font-medium">
                  {update.newProgress}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${update.newProgress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OKRCheckInsPage: React.FC = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [okr, setOkr] = useState<OKR | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { okrId } = useParams();
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!okrId) return;
    
    try {
      const [checkInsResponse, okrResponse] = await Promise.all([
        api.get(`/check-ins/${okrId}`),
        api.get<OKR>(`/okrs/${okrId}`)
      ]);
      
      setCheckIns(checkInsResponse.data);
      setOkr(okrResponse.data);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [okrId]);

  const handleCreateCheckIn = async (form: CreateCheckInForm) => {
    if (!okrId) return;
    
    try {
      const checkInData = {
        ...form,
        okrId: okrId
      };
      await api.post('/check-ins', checkInData);
      setIsCreateModalOpen(false);
      fetchData(); // Обновляем все данные
    } catch (error) {
      console.error('Ошибка при создании чек-ина:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Назад
        </button>
        {okr && !okr.isFrozen && okr.progress < 100 && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Создать чек-ин
          </button>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">История обновлений</h2>
        {checkIns.length > 0 ? (
          <div className="space-y-4">
            {checkIns.map((checkIn) => (
              <CheckInCard
                key={checkIn._id}
                checkIn={checkIn}
                okr={okr}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Нет истории обновлений
          </div>
        )}
      </div>

      <CreateCheckInModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCheckIn}
        okrId={okrId || ''}
      />
    </div>
  );
};

export default OKRCheckInsPage;