
import React, { useState } from 'react';
import { RentalContract } from '../types';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface ContractMasterProps {
  contracts: RentalContract[];
  onAdd: (contract: Omit<RentalContract, 'id'>) => void;
  onDelete: (id: string) => void;
}

const ContractMaster: React.FC<ContractMasterProps> = ({ contracts, onAdd, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = contracts.filter(c => 
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.equipmentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
      <div className="p-4 border-b border-gray-50 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-800">Rental Contract Master</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search contracts..."
              className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => {/* Implement simple add modal or form */}}
            className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-800"
          >
            <Plus size={16} />
            Add Entry
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold">
            <tr>
              <th className="py-3 px-4">Rental Company</th>
              <th className="py-3 px-4">Equipment Type</th>
              <th className="py-3 px-4">Rate Type</th>
              <th className="py-3 px-4">Rate Value</th>
              <th className="py-3 px-4">Remarks</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(contract => (
              <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-semibold text-blue-700">{contract.companyName}</td>
                <td className="py-3 px-4">{contract.equipmentType}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-medium">{contract.rateType}</span>
                </td>
                <td className="py-3 px-4 font-mono">{formatCurrency(contract.rateValue)}</td>
                <td className="py-3 px-4 text-gray-500 text-xs">{contract.remarks}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:text-blue-600"><Edit2 size={14} /></button>
                    <button onClick={() => onDelete(contract.id)} className="p-1 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContractMaster;
