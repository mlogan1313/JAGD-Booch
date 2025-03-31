import { BaseRepository } from './baseRepository';
import { 
  Batch,
  BatchSchema,
  Measurement,
  QualityCheck,
  Stage,
  StageSchema,
  MeasurementSchema
} from '../schemas/batch';
import { ref, get, query, orderByChild, equalTo, limitToLast } from 'firebase/database';
import { database } from '../services/firebase';

type TimeRange = {
  start: number;
  end: number;
};

type ChartDataPoint = {
  timestamp: number;
  value: number;
};

type BatchMetrics = {
  batchId: string;
  name: string;
  startDate: number;
  endDate: number | null;
  duration: number;
  stages: Stage[];
  measurements: Measurement[];
  qualityChecks: QualityCheck[];
};

export class AnalyticsRepository extends BaseRepository<Batch, typeof BatchSchema> {
  constructor() {
    super('batches', BatchSchema);
  }

  async getStages(batchId: string): Promise<Stage[]> {
    const stagesRef = ref(database, `stages/${batchId}`);
    const snapshot = await get(stagesRef);
    if (!snapshot.exists()) return [];
    
    const stages = Object.values(snapshot.val() || {});
    return stages.map(stage => StageSchema.parse(stage));
  }

  async getMeasurements(batchId: string): Promise<Measurement[]> {
    const measurementsRef = ref(database, `measurements/${batchId}`);
    const snapshot = await get(measurementsRef);
    if (!snapshot.exists()) return [];
    
    const measurements = Object.values(snapshot.val() || {});
    return measurements.map(measurement => MeasurementSchema.parse(measurement));
  }

  async getQualityChecks(batchId: string): Promise<QualityCheck[]> {
    const batch = await this.get(batchId);
    if (!batch) return [];
    return batch.qualityChecks || [];
  }

  async getBatchMetrics(batchId: string): Promise<BatchMetrics | null> {
    const batch = await this.get(batchId);
    if (!batch) return null;

    const stages = await this.getStages(batchId);
    const measurements = await this.getMeasurements(batchId);
    const qualityChecks = await this.getQualityChecks(batchId);

    return {
      batchId,
      name: batch.metadata.name,
      startDate: batch.metadata.batchDate,
      endDate: stages[stages.length - 1]?.endTime || null,
      duration: stages[stages.length - 1]?.endTime 
        ? stages[stages.length - 1].endTime! - batch.metadata.batchDate 
        : Date.now() - batch.metadata.batchDate,
      stages,
      measurements,
      qualityChecks
    };
  }

  async getBatchPerformanceData(
    batchId: string,
    timeRange: TimeRange
  ): Promise<{
    ph: ChartDataPoint[];
    temperature: ChartDataPoint[];
  }> {
    const measurements = await this.getMeasurements(batchId);
    
    return {
      ph: measurements
        .filter(m => m.type === 'ph' && m.timestamp >= timeRange.start && m.timestamp <= timeRange.end)
        .map(m => ({ timestamp: m.timestamp, value: m.value }))
        .sort((a, b) => a.timestamp - b.timestamp),
      temperature: measurements
        .filter(m => m.type === 'temperature' && m.timestamp >= timeRange.start && m.timestamp <= timeRange.end)
        .map(m => ({ timestamp: m.timestamp, value: m.value }))
        .sort((a, b) => a.timestamp - b.timestamp)
    };
  }

  async getQualityMetrics(timeRange: TimeRange): Promise<{
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    passRate: number;
    commonIssues: Array<{ type: string; count: number }>;
  }> {
    const batches = await this.getAll();
    const allChecks: QualityCheck[] = [];

    for (const batch of batches) {
      const checks = await this.getQualityChecks(batch.metadata.id);
      allChecks.push(...checks.filter(c => 
        c.timestamp >= timeRange.start && c.timestamp <= timeRange.end
      ));
    }

    const totalChecks = allChecks.length;
    const passedChecks = allChecks.filter(c => c.passed).length;
    const failedChecks = totalChecks - passedChecks;
    const passRate = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;

    // Calculate common issues from failed checks
    const failedByType = allChecks
      .filter(c => !c.passed)
      .reduce((acc, check) => {
        acc[check.type] = (acc[check.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const commonIssues = Object.entries(failedByType)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalChecks,
      passedChecks,
      failedChecks,
      passRate,
      commonIssues
    };
  }

  async getProductionMetrics(timeRange: TimeRange): Promise<{
    totalBatches: number;
    completedBatches: number;
    averageBatchDuration: number;
    totalVolume: number;
    equipmentUtilization: Record<string, number>;
  }> {
    const batches = await this.getAll();
    const relevantBatches = batches.filter(b => 
      b.metadata.batchDate >= timeRange.start && b.metadata.batchDate <= timeRange.end
    );

    const completedBatches = relevantBatches.filter(b => 
      b.currentStage.stage === 'COMPLETED'
    );

    const batchDurations = await Promise.all(
      relevantBatches.map(async b => {
        const stages = await this.getStages(b.metadata.id);
        const lastStage = stages[stages.length - 1];
        return lastStage?.endTime 
          ? lastStage.endTime - b.metadata.batchDate 
          : Date.now() - b.metadata.batchDate;
      })
    );

    const averageBatchDuration = batchDurations.reduce((a, b) => a + b, 0) / batchDurations.length;

    // Calculate equipment utilization
    const equipmentUsage = await Promise.all(
      relevantBatches.map(async b => {
        const stages = await this.getStages(b.metadata.id);
        return stages.map(s => s.equipmentId);
      })
    );

    const equipmentUtilization = equipmentUsage
      .flat()
      .reduce((acc, equipmentId) => {
        acc[equipmentId] = (acc[equipmentId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalBatches: relevantBatches.length,
      completedBatches: completedBatches.length,
      averageBatchDuration,
      totalVolume: relevantBatches.reduce((sum, b) => sum + b.recipe.volume, 0),
      equipmentUtilization
    };
  }
} 