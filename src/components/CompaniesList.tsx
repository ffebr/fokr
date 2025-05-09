import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import CreateCompanyModal from './CreateCompanyModal';

interface CompanyCard {
  id: string;
  name: string;
  roles: string[];
  isCreator: boolean;
  memberCount: number;
}

interface CompaniesListProps {
  companies: CompanyCard[];
  onCompaniesUpdate: () => void;
}

const CompaniesList: React.FC<CompaniesListProps> = ({ companies, onCompaniesUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  if (!companies.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-600 mb-4">У вас пока нет компаний</p>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Создать первую компанию
        </button>
        <CreateCompanyModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={onCompaniesUpdate}
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

      <CreateCompanyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={onCompaniesUpdate}
      />
    </>
  );
};

export default CompaniesList; 