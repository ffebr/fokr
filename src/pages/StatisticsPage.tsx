import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { BarChart2, Users } from 'lucide-react';

const StatisticsPage: React.FC = () => {
  const { companyId } = useParams();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Статистика</h1>
        <p className="text-sm text-gray-500">
          Выберите тип статистики для просмотра
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link 
          to={`/companies/${companyId}/statistics/company`}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center text-gray-600 mb-4">
            <BarChart2 className="w-6 h-6 mr-3" />
            <h2 className="text-lg font-semibold">Статистика компании</h2>
          </div>
          <p className="text-sm text-gray-600">
            Просмотр общей статистики по компании, включая прогресс по всем OKR, активность команд и общие показатели эффективности.
          </p>
        </Link>

        <Link 
          to={`/companies/${companyId}/statistics/team`}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center text-gray-600 mb-4">
            <Users className="w-6 h-6 mr-3" />
            <h2 className="text-lg font-semibold">Статистика команды</h2>
          </div>
          <p className="text-sm text-gray-600">
            Просмотр детальной статистики по конкретной команде, включая прогресс по OKR, активность участников и показатели эффективности.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default StatisticsPage; 