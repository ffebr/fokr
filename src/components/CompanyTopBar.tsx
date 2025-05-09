import React from 'react';

interface CompanyTopBarProps {
  name: string;
  email: string;
  roles: string[];
  companyName: string;
}

const CompanyTopBar: React.FC<CompanyTopBarProps> = ({ name, email, roles, companyName }) => (
  <div className="w-full bg-white shadow px-6 py-4 flex items-center justify-between">
    <div>
      <h1 className="text-xl font-semibold text-gray-800">{companyName} - F_OKR</h1>
    </div>
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <p className="font-medium text-gray-800">{name}</p>
        <p className="text-gray-500 text-sm">{email}</p>
      </div>
      <div className="h-8 w-px bg-gray-200"></div>
      <div>
        <p className="text-gray-700 text-sm">Роли: {roles.join(', ')}</p>
      </div>
    </div>
  </div>
);

export default CompanyTopBar;