import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Target, CheckCircle2, Plus, X, MoreVertical } from 'lucide-react';
import api from '../api/axios';

const metricTypeOptions = [
  { value: 'number', label: 'Число' },
  { value: 'percentage', label: 'Процент' },
  { value: 'currency', label: 'Валюта' },
  { value: 'custom', label: 'Произвольное значение' }
] as const;

const getMetricTypeLabel = (type: string) => {
  return metricTypeOptions.find(option => option.value === type)?.label || type;
};

interface User {
  _id: string;
  name: string;
  email: string;
}

interface TeamMember {
  _id: string;
  userId: User;
}

interface KeyResult {
  title: string;
  description: string;
  metricType: 'number' | 'percentage' | 'currency' | 'custom';
  startValue: number;
  targetValue: number;
  unit: string;
  actualValue: number;
  progress: number;
  attachedTeamOKR?: string;
}

interface OKR {
  _id: string;
  team: string;
  createdBy: string;
  objective: string;
  description: string;
  keyResults: KeyResult[];
  progress: number;
  createdAt: string;
  updatedAt: string;
  parentOKR?: string;
  parentKRIndex?: number;
  deadline: string;
  isFrozen: boolean;
  attachedCorporateOKR?: {
    _id: string;
    objective: string;
    krIndex: number;
    krTitle: string;
    progress: number;
    teams: {
      _id: string;
      name: string;
    }[];
    linkedOKRs: LinkedOKR[];
  };
}

interface Team {
  _id: string;
  name: string;
  companyId: string;
  createdBy: string;
  members: TeamMember[];
  requiredRoles: string[];
  createdAt: string;
  updatedAt: string;
}

interface AssignedKeyResult {
  corporateOKRId: string;
  companyName: string;
  objective: string;
  keyResult: {
    title: string;
    description: string;
    startValue: number;
    unit: string;
    teams: string[];
    progress: number;
  };
}

interface CreateOKRForm {
  objective: string;
  description: string;
  keyResults: {
    title: string;
    description: string;
    metricType: 'number' | 'percentage' | 'currency' | 'duration' | 'custom';
    startValue: number;
    targetValue: number;
    unit: string;
  }[];
  status: 'draft' | 'active' | 'done';
  parentOKR?: string;
  parentKRIndex?: number;
  deadline: string;
}

interface CorporateKeyResult {
  title: string;
  description: string;
  progress: number;
  teams: {
    _id: string;
    name: string;
  }[];
}

interface LinkedOKR {
  _id: string;
  objective: string;
  progress: number;
  team: {
    _id: string;
    name: string;
  };
}

interface CorporateKRResponse {
  keyResult: CorporateKeyResult;
  linkedOKRs: LinkedOKR[];
}

interface AttachOKRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttach: (corporateOKRId: string, krIndex: number) => void;
  teamId: string;
}

const AttachOKRModal: React.FC<AttachOKRModalProps> = ({ isOpen, onClose, onAttach, teamId }) => {
  const [assignedKRs, setAssignedKRs] = useState<AssignedKeyResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAssignedKRs();
    }
  }, [isOpen]);

  const fetchAssignedKRs = async () => {
    if (!teamId) return;
    setLoading(true);
    try {
      const response = await api.get(`/teams/${teamId}/assigned-key-results`);
      setAssignedKRs(response.data.assignedKeyResults);
    } catch (error) {
      console.error('Ошибка при загрузке назначенных KR:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Выберите назначенный KR</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedKRs.length > 0 ? (
              assignedKRs.map((kr) => (
                <div
                  key={kr.corporateOKRId}
                  className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    onAttach(kr.corporateOKRId, 0);
                    onClose();
                  }}
                >
                  <h3 className="font-medium">{kr.keyResult.title}</h3>
                  {kr.keyResult.description && (
                    <p className="text-sm text-gray-600 mt-1">{kr.keyResult.description}</p>
                  )}
                  <div className="mt-2">
                    <div className="text-sm text-gray-600">Прогресс: {kr.keyResult.progress}%</div>
                    <div className="text-sm text-gray-600">Компания: {kr.companyName}</div>
                    <div className="text-sm text-gray-600">Цель: {kr.objective}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                Нет назначенных KR для этой команды
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const OKRCard: React.FC<{ 
  okr: OKR;
  onStatusChange: (okrId: string) => void;
  onAttachToAssignedKR: (okrId: string, corporateOKRId: string, krIndex: number) => void;
}> = ({ okr, onStatusChange, onAttachToAssignedKR }) => {
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const navigate = useNavigate();
  const { teamId, companyId } = useParams();

  const handleFreezeToggle = async () => {
    try {
      await api.patch(`/okrs/${okr._id}/freeze`, {
        isFrozen: !okr.isFrozen
      });
      // Обновляем состояние OKR после успешного запроса
      onStatusChange(okr._id);
      setIsStatusMenuOpen(false);
    } catch (error) {
      console.error('Ошибка при изменении состояния заморозки OKR:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 
            className="text-lg font-semibold cursor-pointer hover:text-blue-600"
            onClick={() => navigate(`/companies/${companyId}/teams/${teamId}/okrs/${okr._id}`)}
          >
            {okr.objective}
          </h3>
          {okr.isFrozen && (
            <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              Заморожен
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
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
                    onClick={handleFreezeToggle}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {okr.isFrozen ? 'Разморозить' : 'Заморозить'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {okr.description && (
        <p className="text-gray-600 text-sm mb-4">{okr.description}</p>
      )}

      <div className="text-sm text-gray-500 mb-4">
        <div>Срок: {new Date(okr.deadline).toLocaleDateString('ru-RU')}</div>
      </div>

      {okr.attachedCorporateOKR && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <div className="text-sm font-medium text-blue-800 mb-1">
            Прикреплено к корпоративному KR
          </div>
          <div className="text-sm text-blue-600">
            {okr.attachedCorporateOKR.krTitle}
          </div>
          <div className="text-xs text-blue-500 mt-1">
            Описание: {okr.attachedCorporateOKR.objective}
          </div>
          <div className="text-xs text-blue-500 mt-1">
            Прогресс: {okr.attachedCorporateOKR.progress}%
          </div>
          {okr.attachedCorporateOKR.teams && okr.attachedCorporateOKR.teams.length > 0 && (
            <div className="text-xs text-blue-500 mt-1">
              Команды: {okr.attachedCorporateOKR.teams.map(team => team.name).join(', ')}
            </div>
          )}
          {okr.attachedCorporateOKR.linkedOKRs && okr.attachedCorporateOKR.linkedOKRs.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-medium text-blue-800">Прикрепленные OKR:</div>
              <div className="mt-1 space-y-1">
                {okr.attachedCorporateOKR.linkedOKRs.map(linkedOKR => (
                  <div key={linkedOKR._id} className="text-xs text-blue-600">
                    • {linkedOKR.objective} ({linkedOKR.team.name}) - {linkedOKR.progress}%
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {okr.keyResults.map((kr, index) => (
          <div key={index} className="bg-gray-50 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{kr.title}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{kr.progress}%</span>
              </div>
            </div>
            {kr.description && (
              <p className="text-sm text-gray-600 mb-2">{kr.description}</p>
            )}
            <div className="text-sm text-gray-600 mb-2">
              <div>Тип метрики: {getMetricTypeLabel(kr.metricType)}</div>
              <div>Текущее значение: {kr.actualValue} {kr.unit}</div>
              <div>Целевое значение: {kr.targetValue} {kr.unit}</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${kr.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Общий прогресс</span>
          <span className="text-sm font-medium">{okr.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-green-600 h-2 rounded-full"
            style={{ width: `${okr.progress}%` }}
          ></div>
        </div>
      </div>

      {!okr.attachedCorporateOKR && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setIsAttachModalOpen(true)}
            className="w-full text-center px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            Прикрепить к назначенному KR
          </button>
        </div>
      )}

      <AttachOKRModal
        isOpen={isAttachModalOpen}
        onClose={() => setIsAttachModalOpen(false)}
        onAttach={(corporateOKRId, krIndex) => onAttachToAssignedKR(okr._id, corporateOKRId, krIndex)}
        teamId={teamId || ''}
      />
    </div>
  );
};

const CreateOKRModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (okr: CreateOKRForm) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState<CreateOKRForm>({
    objective: '',
    description: '',
    keyResults: [{ 
      title: '', 
      description: '', 
      metricType: 'number',
      startValue: 0,
      targetValue: 0,
      unit: ''
    }],
    status: 'active',
    deadline: new Date().toISOString().split('T')[0]
  });
  const [assignedKRs, setAssignedKRs] = useState<AssignedKeyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const { teamId } = useParams();

  useEffect(() => {
    if (isOpen && teamId) {
      fetchAssignedKRs();
    }
  }, [isOpen, teamId]);

  const fetchAssignedKRs = async () => {
    if (!teamId) return;
    setLoading(true);
    try {
      const response = await api.get(`/teams/${teamId}/assigned-key-results`);
      setAssignedKRs(response.data.assignedKeyResults);
    } catch (error) {
      console.error('Ошибка при загрузке назначенных KR:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const addKeyResult = () => {
    setForm(prev => ({
      ...prev,
      keyResults: [...prev.keyResults, { title: '', description: '', metricType: 'number', startValue: 0, targetValue: 0, unit: '' }]
    }));
  };

  const removeKeyResult = (index: number) => {
    setForm(prev => ({
      ...prev,
      keyResults: prev.keyResults.filter((_, i) => i !== index)
    }));
  };

  const updateKeyResult = (index: number, field: 'title' | 'description' | 'metricType' | 'startValue' | 'targetValue' | 'unit', value: string | number) => {
    setForm(prev => ({
      ...prev,
      keyResults: prev.keyResults.map((kr, i) => 
        i === index ? { ...kr, [field]: value } : kr
      )
    }));
  };

  const selectAssignedKR = (kr: AssignedKeyResult) => {
    setForm(prev => ({
      ...prev,
      parentOKR: kr.corporateOKRId,
      parentKRIndex: 0
    }));
    setIsSelectOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Создать новый OKR</h2>
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
              Цель
            </label>
            <input
              type="text"
              value={form.objective}
              onChange={(e) => setForm(prev => ({ ...prev, objective: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Срок выполнения
            </label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm(prev => ({ ...prev, deadline: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {assignedKRs.length > 0 && !form.parentOKR && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Выбрать назначенный KR
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="text-gray-500">Выберите KR из списка</span>
                </button>
                
                {isSelectOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {assignedKRs.map((kr) => (
                      <button
                        key={kr.corporateOKRId}
                        type="button"
                        onClick={() => selectAssignedKR(kr)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <div className="flex-shrink-0 w-4 h-4 border border-gray-300 rounded-sm">
                          {form.parentOKR === kr.corporateOKRId && (
                            <div className="w-full h-full bg-blue-600 rounded-sm" />
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="font-medium truncate">{kr.keyResult.title}</div>
                          <div className="text-sm text-gray-500 truncate">
                            {kr.objective}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {form.parentOKR && (
            <div className="bg-blue-50 p-4 rounded-md mb-4">
              <div className="text-sm text-blue-800 mb-2">
                Выбран корпоративный KR
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm(prev => ({
                    ...prev,
                    parentOKR: undefined,
                    parentKRIndex: undefined
                  }));
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Отменить выбор
              </button>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Ключевые результаты
              </label>
              <button
                type="button"
                onClick={addKeyResult}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Добавить результат
              </button>
            </div>

            <div className="space-y-4">
              {form.keyResults.map((kr, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Результат {index + 1}</span>
                    {form.keyResults.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKeyResult(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={kr.title}
                    onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
                    placeholder="Название результата"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <textarea
                    value={kr.description}
                    onChange={(e) => updateKeyResult(index, 'description', e.target.value)}
                    placeholder="Описание результата"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Тип метрики
                      </label>
                      <select
                        value={kr.metricType}
                        onChange={(e) => updateKeyResult(index, 'metricType', e.target.value as 'number' | 'percentage' | 'currency' | 'duration' | 'custom')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {metricTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Единица измерения
                      </label>
                      <input
                        type="text"
                        value={kr.unit}
                        onChange={(e) => updateKeyResult(index, 'unit', e.target.value)}
                        placeholder="шт., %, $, ч. и т.д."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Начальное значение
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          value={kr.startValue}
                          onChange={(e) => updateKeyResult(index, 'startValue', Number(e.target.value))}
                          className="flex-1"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={kr.startValue}
                            onChange={(e) => updateKeyResult(index, 'startValue', Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">{kr.unit}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Целевое значение
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          value={kr.targetValue}
                          onChange={(e) => updateKeyResult(index, 'targetValue', Number(e.target.value))}
                          className="flex-1"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={kr.targetValue}
                            onChange={(e) => updateKeyResult(index, 'targetValue', Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">{kr.unit}</span>
                        </div>
                      </div>
                    </div>
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
              Создать OKR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TeamDetailPage: React.FC = () => {
  const [team, setTeam] = useState<Team | null>(null);
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { teamId } = useParams();

  const fetchTeamOKRs = async () => {
    if (!teamId) return;
    try {
      const okrsResponse = await api.get(`/teams/${teamId}/okrs`);
      const okrsData = okrsResponse.data.okrs;
      const okrsWithAttachedInfo = await Promise.all(
        okrsData.map(async (okr: OKR) => {
          if (!okr.parentOKR || okr.parentKRIndex === undefined) {
            return okr;
          }
          
          try {
            const response = await api.get<CorporateKRResponse>(
              `/corporate-okrs/${okr.parentOKR}/key-results/${okr.parentKRIndex}`
            );
            
            return {
              ...okr,
              attachedCorporateOKR: {
                _id: okr.parentOKR,
                krIndex: okr.parentKRIndex,
                krTitle: response.data.keyResult.title,
                objective: response.data.keyResult.description,
                progress: response.data.keyResult.progress,
                teams: response.data.keyResult.teams,
                linkedOKRs: response.data.linkedOKRs
              }
            };
          } catch (error) {
            return okr;
          }
        })
      );
      
      console.log('Final OKRs with attached info:', okrsWithAttachedInfo);
      setOkrs(okrsWithAttachedInfo);
    } catch (error) {
      console.error('Ошибка при загрузке OKR команды:', error);
    }
  };

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!teamId) {
        console.error('Требуется ID команды');
        setLoading(false);
        return;
      }

      try {
        // Получаем информацию о команде
        const teamResponse = await api.get(`/teams/${teamId}`);
        setTeam(teamResponse.data);

        // Получаем OKR команды с информацией о прикрепленных KR
        await fetchTeamOKRs();
      } catch (error) {
        console.error('Ошибка при загрузке данных команды:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  const handleCreateOKR = async (okrData: CreateOKRForm) => {
    if (!teamId) return;

    try {
      // Подготавливаем данные для отправки
      const requestData = {
        objective: okrData.objective,
        description: okrData.description,
        keyResults: okrData.keyResults,
        ...(okrData.parentOKR && {
          parentOKR: okrData.parentOKR,
          parentKRIndex: okrData.parentKRIndex
        }),
        deadline: new Date(okrData.deadline).toISOString(),
        isFrozen: false
      };
      console.log(requestData);

      const response = await api.post(`/teams/${teamId}/okrs`, requestData);
      const newOKR = response.data.okr;

      // Если OKR прикреплена к корпоративному KR, загружаем информацию о нем
      if (newOKR.parentOKR && newOKR.parentKRIndex !== undefined) {
        try {
          const krResponse = await api.get<CorporateKRResponse>(
            `/corporate-okrs/${newOKR.parentOKR}/key-results/${newOKR.parentKRIndex}`
          );
          
          newOKR.attachedCorporateOKR = {
            _id: newOKR.parentOKR,
            krIndex: newOKR.parentKRIndex,
            krTitle: krResponse.data.keyResult.title,
            objective: krResponse.data.keyResult.description,
            progress: krResponse.data.keyResult.progress,
            teams: krResponse.data.keyResult.teams,
            linkedOKRs: krResponse.data.linkedOKRs
          };
        } catch (error) {
          console.error('Ошибка при загрузке информации о прикрепленном KR:', error);
        }
      }

      setOkrs(prev => [...prev, newOKR]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Ошибка при создании OKR:', error);
    }
  };

  const handleStatusChange = async (okrId: string) => {
    try {
      // Обновляем список OKR после изменения состояния заморозки
      await fetchTeamOKRs();
    } catch (error) {
      console.error('Ошибка при обновлении OKR:', error);
    }
  };

  const handleAttachToAssignedKR = async (okrId: string, corporateOKRId: string, krIndex: number) => {
    try {
      await api.post(`/okrs/${okrId}/link-to-corporate`, {
        corporateOKRId,
        krIndex
      });
      
      // Обновляем список OKR с информацией о прикрепленных KR
      await fetchTeamOKRs();
    } catch (error) {
      console.error('Ошибка при прикреплении OKR к назначенному KR:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center text-gray-500 mt-8">
        Команда не найдена
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{team.name}</h1>
        <p className="text-sm text-gray-500">
          Создана: {new Date(team.createdAt).toLocaleDateString('ru-RU')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center text-gray-600 mb-4">
            <Users className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold">Участники команды</h2>
          </div>
          
          {team.members.length > 0 ? (
            <div className="space-y-2">
              {team.members.map((member) => (
                <div key={member._id} className="text-sm text-gray-600">
                  {member.userId.name} ({member.userId.email})
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Нет участников в команде
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center text-gray-600 mb-4">
            <Target className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold">Требуемые роли</h2>
          </div>
          
          {team.requiredRoles.length > 0 ? (
            <div className="space-y-2">
              {team.requiredRoles.map((role, index) => (
                <div key={index} className="text-sm text-gray-600">
                  {role}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Нет требуемых ролей
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center text-gray-600">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          <h2 className="text-lg font-semibold">OKR команды</h2>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Создать OKR
        </button>
      </div>

      {okrs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {okrs.map((okr) => (
            <OKRCard 
              key={okr._id} 
              okr={okr} 
              onStatusChange={handleStatusChange}
              onAttachToAssignedKR={handleAttachToAssignedKR}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          Нет OKR для этой команды
        </div>
      )}

      <CreateOKRModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOKR}
      />
    </div>
  );
};

export default TeamDetailPage; 