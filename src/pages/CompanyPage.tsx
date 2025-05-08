import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Settings } from 'lucide-react';
import api from '../api/axios';

interface Company {
  _id: string;
  name: string;
  // ... other company fields
}

const CompanyPage: React.FC = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await api.get(`/companies/${companyId}`);
        setCompany(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке компании:', error);
      }
    };

    fetchCompany();
  }, [companyId]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{company?.name}</h1>
        <Link
          to="settings"
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-5 h-5 mr-2" />
          Настройки
        </Link>
      </div>
      {/* Rest of the company page content */}
    </div>
  );
};

export default CompanyPage; 