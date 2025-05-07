import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import api from '../api/axios';

interface CompanySummary {
  _id: string;
  name: string;
  userRoles?: string[];
  userRole?: string;
  isCreator?: boolean;
}

interface CompanyDetails {
  users: Array<{ id: string; name: string; email: string; roles: string[] }>;
}

interface CompanyCard {
  id: string;
  name: string;
  roles: string[];
  isCreator: boolean;
  memberCount: number;
}

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const navigate = useNavigate();

  const fetchCompanies = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/companies');
      const data = res.data as any;
      let summaries: CompanySummary[] = [];
      if (Array.isArray(data)) {
        summaries = data;
      } else {
        if (Array.isArray(data.createdCompanies)) summaries = summaries.concat(data.createdCompanies);
        if (Array.isArray(data.memberCompanies)) summaries = summaries.concat(data.memberCompanies);
      }
      const details = await Promise.all(
        summaries.map(c => api.get<CompanyDetails>(`/companies/${c._id}`))
      );
      const cards = summaries.map((c, idx) => {
        const rolesArray: string[] = Array.isArray(c.userRoles)
          ? c.userRoles
          : c.userRole
            ? [c.userRole]
            : [];
        return {
          id: c._id,
          name: c.name,
          roles: rolesArray,
          isCreator: Boolean(c.isCreator),
          memberCount: details[idx].data.users.length,
        };
      });
      setCompanies(cards);
    } catch (err: any) {
      console.error(err);
      setError('Не удалось загрузить компании');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const res = await api.post('/companies', { name: newName });
      // Закрываем модалку и обновляем список
      setShowModal(false);
      setNewName('');
      fetchCompanies();
    } catch (err: any) {
      console.error(err);
      setCreateError(err.response?.data?.message || 'Ошибка создания компании');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Загрузка компаний...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!companies.length) return <div className="p-6 text-center">У вас нет доступных компаний.</div>;

  return (
    <>
      <div className="mt-8 flex justify-center">
        <div className="max-w-screen-xl w-full px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {companies.map(company => {
            const displayRoles = [
              company.isCreator && 'Создатель',
              ...company.roles
            ].filter(Boolean).join(', ');

            return (
              <div
                key={company.id}
                onClick={() => navigate(`/companies/${company.id}`)}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
              >
                <h3 className="text-xl font-semibold mb-2">{company.name}</h3>
                <p className="text-gray-600 mb-1">Роли: {displayRoles}</p>
                <p className="text-gray-600">Участников: {company.memberCount}</p>
              </div>
            );
          })}

          {/* Карточка создания новой компании */}
          <div
            onClick={() => setShowModal(true)}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center"
          >
            <Plus className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">Создать компанию</h3>
          </div>
        </div>
      </div>

      {/* Модальное окно создания */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold mb-4">Новая компания</h2>
            {createError && <p className="text-red-600 mb-2">{createError}</p>}
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Название компании</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mr-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${creating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {creating ? 'Создаем...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CompaniesPage;
