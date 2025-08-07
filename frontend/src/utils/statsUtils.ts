import { HerbColorMap, PatientData, StageStats } from '../types';

export interface HerbStats {
  herb: string;
  totalCount: number;
  patientCount: number;
  patientRatio: string;
  stageCounts: StageStats[];
}

export const getStageIndex = (visitIndex: number, totalVisits: number): number => {
  return Math.floor((visitIndex * 3) / totalVisits);
};

export const calculateHerbStats = (
  patientDataMap: Record<string, PatientData>,
  herbColorMap: HerbColorMap,
  category: string
): HerbStats[] => {
  const totalPatients = Object.keys(patientDataMap).length;
  const herbStats: Record<string, {
    totalCount: number;
    patients: Set<string>;
    stages: Array<Set<string>>;
    counts: number[];
  }> = {};

  // Initialize stats for all herbs in the category
  Object.values(patientDataMap).forEach(patientData => {
    if (!patientData || typeof patientData !== 'object') return;
    
    Object.entries(patientData).forEach(([visitIndex, visit]) => {
      if (!visit || !visit.scripts || typeof visit.scripts !== 'object') return;
      
      Object.keys(visit.scripts).forEach(herb => {
        if (herbColorMap[herb]?.book_category === category && !herbStats[herb]) {
          herbStats[herb] = {
            totalCount: 0,
            patients: new Set(),
            stages: [new Set(), new Set(), new Set()],
            counts: [0, 0, 0],
          };
        }
      });
    });
  });

  // Calculate statistics
  Object.entries(patientDataMap).forEach(([patientId, patientData]) => {
    if (!patientData || typeof patientData !== 'object') return;
    
    const visitCount = Object.keys(patientData).length;
    
    Object.entries(patientData).forEach(([visitIndex, visit]) => {
      if (!visit || !visit.scripts || typeof visit.scripts !== 'object') return;
      
      const stageIndex = getStageIndex(Number(visitIndex) - 1, visitCount); // 修正索引计算
      
      Object.entries(visit.scripts).forEach(([herb, data]) => {
        // 确保 herbStats[herb] 存在再访问
        if (herbStats[herb] && herbColorMap[herb]?.book_category === category) {
          herbStats[herb].totalCount++;
          herbStats[herb].patients.add(patientId);
          herbStats[herb].stages[stageIndex].add(patientId);
          herbStats[herb].counts[stageIndex]++;
        }
      });
    });
  });

  // Format results
  return Object.entries(herbStats).map(([herb, stats]) => ({
    herb,
    totalCount: stats.totalCount,
    patientCount: stats.patients.size,
    patientRatio: `${stats.patients.size}/${totalPatients}`,
    stageCounts: stats.stages.map((patients, index) => ({
      count: stats.counts[index],
      ratio: `${patients.size}/${totalPatients}`,
    })),
  }));
};
