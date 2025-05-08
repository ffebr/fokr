import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import api from '../api/axios';

interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
}

interface Role {
  name: string;
  description: string;
  users: User[];
}

const RoleCard: React.FC<{ role: Role }> = ({ role }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{role.name}</h3>
        {role.description && (
          <p className="text-gray-600 text-sm mt-1">{role.description}</p>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center text-gray-600 mb-2">
          <Users className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">
            Пользователи с этой ролью ({role.users.length})
          </span>
        </div>
        
        {role.users.length > 0 ? (
          <div className="space-y-2">
            {role.users.map((user) => (
              <div key={user._id} className="text-sm text-gray-600 pl-6">
                {user.name} ({user.email})
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 pl-6">
            Нет пользователей с этой ролью
          </div>
        )}
      </div>
    </div>
  );
};

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const { companyId } = useParams();

  useEffect(() => {
    const fetchRoles = async () => {
      if (!companyId) {
        console.error('Требуется ID компании');
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        // Получаем информацию о компании, включая роли и пользователей
        const response = await api.get(`/companies/${companyId}`);
        const companyData = response.data;

        // Формируем массив ролей с пользователями
        const rolesWithUsers = companyData.roles.map((role: { name: string; description: string }) => ({
          name: role.name,
          description: role.description,
          users: companyData.users.filter((user: User) => 
            user.roles.includes(role.name)
          )
        }));

        setRoles(rolesWithUsers);
      } catch (error) {
        console.error('Ошибка при загрузке ролей:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
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
      <h2 className="text-2xl font-bold mb-6">Роли в компании</h2>
      {roles.length === 0 ? (
        <div className="text-center text-gray-500">Роли не найдены</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roles.map((role) => (
            <RoleCard key={role.name} role={role} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RolesPage; 