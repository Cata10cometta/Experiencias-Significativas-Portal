import React, { useState } from 'react';
import Criteria from './Criteria';
import Grade from './Grade';
import LineThematic from './LineThematic';
import PopulationGrade from './PopulationGrade';
import State from './State';


const tabs = [
  { key: 'criteria', label: 'Criterios' },
  { key: 'grade', label: 'Grados' },
  { key: 'lineThematic', label: 'Lineas Temáticas' },
  { key: 'populationGrade', label: 'Grupos Poblacionales' },
  { key: 'state', label: 'Estados' },
];

const ParameterMain: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('criteria');

  return (
    <div className="parameter-tabs-container w-full max-w-full mx-auto px-2 sm:px-6 py-4 sm:py-6">
      <div className="bg-white rounded-full! shadow-sm py-2 px-2 sm:px-3 mb-3">
        <nav className="flex flex-wrap gap-2 sm:gap-4 parameter-tabs-nav">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${activeTab === t.key ? 'text-sky-600 border-b-2 border-sky-600' : 'text-gray-600 hover:text-sky-600'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-2">
        {activeTab === 'criteria' && <Criteria />}
        {activeTab === 'grade' && <Grade />}
        {activeTab === 'lineThematic' && <LineThematic />}
        {activeTab === 'populationGrade' && <PopulationGrade />}
        {activeTab === 'state' && <State />}
      </div>
    </div>
  );
};

export default ParameterMain;
