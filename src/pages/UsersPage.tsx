import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Briefcase } from 'lucide-react';
import api from '../api/axios';

interface User {
  _id: string;
  email: string;
  name: string;
  roles: string[];
}

const UserCard: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <h3 className="text-lg font-semibold mb-2">
        {user.name}
      </h3>
      
      <div className="space-y-2">
        <div className="flex items-center text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          <span className="text-sm">{user.email}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Briefcase className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {user.roles && user.roles.length > 0 
              ? user.roles.join(', ') 
              : 'Нет назначенных ролей'}
          </span>
        </div>
      </div>
    </div>
  );
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { companyId } = useParams();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!companyId) {
        console.error('Требуется ID компании');
        setUsers([]);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/companies/${companyId}/users`);
        const usersData = response.data.users || [];
        setUsers(usersData);
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Сотрудники</h2>
      {users.length === 0 ? (
        <div className="text-center text-gray-500">Сотрудники не найдены</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersPage; 