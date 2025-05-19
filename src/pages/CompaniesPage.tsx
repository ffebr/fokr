import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CompaniesList from '../components/CompaniesList';

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

interface User {
  id: string;
  name: string;
  email: string;
}

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
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
    // Получаем информацию о пользователе из localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="p-6 text-center">Загрузка...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Профиль</h2>
          {user && (
            <div className="space-y-2">
              <p className="text-gray-700">{user.name}</p>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Выйти
        </button>
      </div>

      {/* Правая панель со списком компаний */}
      <div className="flex-1 p-8">
        <CompaniesList companies={companies} onCompaniesUpdate={fetchCompanies} />
      </div>
    </div>
  );
};

export default CompaniesPage;
