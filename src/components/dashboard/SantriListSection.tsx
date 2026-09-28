import React from 'react';
import type { Santri } from './types';
import { SantriCard } from './SantriCard';

interface SantriListSectionProps {
  santriList: Santri[];
  onSetor: (santri: Santri) => void;
  onDetail: (santri: Santri) => void;
}

export const SantriListSection: React.FC<SantriListSectionProps> = ({
  santriList,
  onSetor,
  onDetail,
}) => {
  return (
    <div className="space-y-3">
      {/* Scrollable grid container for santri cards */}
      <div 
        className="max-h-[380px] overflow-y-auto pr-1"
        tabIndex={0}
        aria-label="Daftar Santri"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {santriList.map((santri) => (
            <SantriCard
              key={santri.id}
              santri={santri}
              onSetor={onSetor}
              onDetail={onDetail}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
