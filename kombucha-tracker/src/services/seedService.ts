import { z } from 'zod';
import { BatchRepository } from '../repositories/batchRepository';
import { EquipmentRepository } from '../repositories/equipmentRepository';
import { ContainerRepository } from '../repositories/containerRepository';
import { QualityRepository, QualityCheck } from '../repositories/qualityRepository';
import { Batch, BatchSchema, StageEnum, BatchTypeEnum } from '../schemas/batch';
import { Equipment, EquipmentSchema, EquipmentTypeEnum, EquipmentStatusEnum } from '../schemas/equipment';
import { Container, ContainerSchema, ContainerTypeEnum, ContainerStatusEnum } from '../schemas/container';
import { QualityCheckTypeEnum, QualityCheckStatusEnum, QualityNoteSeverityEnum, QualityNote, QualityCheckSchema } from '../schemas/quality';

export class SeedService {
  private static instance: SeedService;
  private batchRepository: BatchRepository;
  private equipmentRepository: EquipmentRepository;
  private containerRepository: ContainerRepository;
  private qualityRepository: QualityRepository;
  private userId: string | null = null;

  private constructor() {
    this.batchRepository = new BatchRepository();
    this.equipmentRepository = new EquipmentRepository();
    this.containerRepository = new ContainerRepository();
    this.qualityRepository = new QualityRepository();
  }

  static getInstance(): SeedService {
    if (!SeedService.instance) {
      SeedService.instance = new SeedService();
    }
    return SeedService.instance;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private ensureUserId(): string {
    if (!this.userId) {
      throw new Error('SeedService User ID not set');
    }
    return this.userId;
  }

  /**
   * Clear all relevant data for the current user (Use with caution!)
   */
  async clearAllData(): Promise<void> {
    const userId = this.ensureUserId();
    console.warn(`Clearing data for user: ${userId}`);

    // Clear batches owned by the user
    const batches = await this.batchRepository.getAll(userId);
    for (const batch of batches) {
        await this.batchRepository.delete(batch.id, userId);
    }
    console.log('Cleared batches.');

    // Clear equipment owned by the user
    const equipmentList = await this.equipmentRepository.getAll(userId);
    console.log('Equipment found for deletion:', equipmentList);
    for (const equip of equipmentList) {
        try {
            await this.equipmentRepository.delete(equip.id, userId);
        } catch (error) {
            console.error(`Failed to delete equipment ${equip.id}:`, error);
        }
    }
    console.log('Cleared equipment.');

    // Clear containers owned by the user
    const containers = await this.containerRepository.getAll(userId);
    for (const container of containers) {
        await this.containerRepository.delete(container.id, userId);
    }
    console.log('Cleared containers.');
    
    // Clear quality checks owned by the user
    const qualityChecks = await this.qualityRepository.getAllQualityChecks();
    const userChecks = qualityChecks.filter(qc => qc.createdBy === userId || qc.updatedBy === userId);
    console.log('Cleared quality checks (manual deletion may be needed if repo lacks delete).');

    console.log('Finished clearing data.');
  }

  /**
   * Seed sample data for testing
   */
  async seedSampleData(): Promise<void> {
    const userId = this.ensureUserId();
    console.log(`Starting data seeding for user: ${userId}`);
    await this.clearAllData();

    const equipment = await this.seedEquipment(userId);
    const batches = await this.seedBatches(userId, equipment);
    const containers = await this.seedContainers(userId, batches);
    await this.seedQualityChecks(userId, batches);

    if (batches.length > 0 && equipment.length > 0) {
      await this.equipmentRepository.updateStatus(equipment[0].id, EquipmentStatusEnum.enum.IN_USE, batches[0].id);
    }
    if (batches.length > 1 && equipment.length > 1) {
      await this.equipmentRepository.updateStatus(equipment[1].id, EquipmentStatusEnum.enum.IN_USE, batches[1].id);
    }
    if (containers.length > 0 && batches.length > 0) {
      await this.containerRepository.updateStatus(containers[0].id, ContainerStatusEnum.enum.FILLED, batches[0].id);
    }
    console.log('Finished data seeding.');
  }

  // --- Seeding Methods --- 

  private async seedEquipment(userId: string): Promise<Equipment[]> {
    console.log('Seeding equipment...');
    const currentTime = Date.now();
    const equipmentData: Omit<Equipment, 'id'>[] = [
      {
        metadata: { 
          name: '20 Gallon Kettle', 
          type: EquipmentTypeEnum.enum.KETTLE, 
          capacity: 20, 
          description: 'Main brewing kettle',
          createdBy: userId, 
          createdAt: currentTime, 
          updatedAt: currentTime
        },
        status: { current: EquipmentStatusEnum.enum.AVAILABLE, lastUpdated: currentTime, currentBatchId: undefined }, 
        maintenance: { lastCleaned: undefined, lastMaintained: undefined, nextMaintenance: undefined, notes: 'New' }
      },
      {
        metadata: { 
          name: '5 Gallon Fermenter 1', 
          type: EquipmentTypeEnum.enum.FERMENTER, 
          capacity: 5, 
          description: 'Primary Fermenter A',
          createdBy: userId, 
          createdAt: currentTime, 
          updatedAt: currentTime
        },
        status: { current: EquipmentStatusEnum.enum.AVAILABLE, lastUpdated: currentTime, currentBatchId: undefined },
        maintenance: { lastCleaned: undefined, lastMaintained: undefined, nextMaintenance: undefined, notes: 'New' }
      },
      {
        metadata: { 
          name: '5 Gallon Fermenter 2', 
          type: EquipmentTypeEnum.enum.FERMENTER, 
          capacity: 5, 
          description: 'Primary Fermenter B',
          createdBy: userId, 
          createdAt: currentTime, 
          updatedAt: currentTime 
        },
        status: { current: EquipmentStatusEnum.enum.AVAILABLE, lastUpdated: currentTime, currentBatchId: undefined },
        maintenance: { lastCleaned: undefined, lastMaintained: undefined, nextMaintenance: undefined, notes: 'New' }
      },
    ];
    
    const createdEquipment: Equipment[] = [];
    for (const item of equipmentData) {
      try {
        const created = await this.equipmentRepository.create(item, userId); 
        createdEquipment.push(created);
      } catch (error) {
        console.error('Error creating equipment:', error, item);
      }
    }
    console.log(`Seeded ${createdEquipment.length} equipment items.`);
    return createdEquipment;
  }

  private async seedContainers(userId: string, batches: Batch[]): Promise<Container[]> {
    console.log('Seeding containers...');
    const currentTime = Date.now();
    if (batches.length === 0) {
        console.log('Skipping container seeding, no batches provided.');
        return [];
    }
    const containerData: Omit<Container, 'id'>[] = [
      {
        metadata: { 
          name: 'Bottle Set 1 (16oz)', 
          type: ContainerTypeEnum.enum.BOTTLE, 
          capacity: 0.125 * 24, 
          description: 'Case of 24 x 16oz bottles',
          createdBy: userId, 
          createdAt: currentTime, 
          updatedAt: currentTime
        },
        status: { current: ContainerStatusEnum.enum.EMPTY, lastUpdated: currentTime, currentBatchId: undefined, fillDate: undefined, emptyDate: undefined }
      },
      {
        metadata: { 
          name: 'Keg 1 (5 Gallon)', 
          type: ContainerTypeEnum.enum.KEG, 
          capacity: 5, 
          description: 'Standard 5 gallon keg',
          createdBy: userId, 
          createdAt: currentTime, 
          updatedAt: currentTime 
        },
        status: { current: ContainerStatusEnum.enum.EMPTY, lastUpdated: currentTime, currentBatchId: undefined, fillDate: undefined, emptyDate: undefined }
      },
    ];
    
    const createdContainers: Container[] = [];
    for (const item of containerData) {
      try {
        const created = await this.containerRepository.create(item, userId);
        createdContainers.push(created);
      } catch (error) {
         console.error('Error creating container:', error, item);
      }
    }
    console.log(`Seeded ${createdContainers.length} container items.`);
    return createdContainers;
  }

  private async seedBatches(userId: string, equipment: Equipment[]): Promise<Batch[]> {
    console.log('Seeding batches...');
     if (equipment.length < 2) {
        console.log('Skipping batch seeding, need at least 2 equipment items.');
        return [];
    }
    const now = Date.now();
    const fiveDaysAgo = now - (5 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = now - (10 * 24 * 60 * 60 * 1000);
    const twelveDaysAgo = now - (12 * 24 * 60 * 60 * 1000);

    // Pre-define sample quality note data with unique IDs
    const sampleQualityNote1: Omit<QualityNote, 'batchId'> = {
        id: `qn-${now}-1`, // Generate unique ID
        timestamp: fiveDaysAgo, 
        note: 'Slightly hazy appearance, monitoring.',
        severity: QualityNoteSeverityEnum.enum.INFO, 
        resolved: false, 
        createdBy: userId, 
        updatedBy: userId,
        resolution: undefined, 
        resolvedAt: undefined
    };

    const batchesData: Omit<Batch, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'>[] = [
      {
        name: 'LimeAid (Active 1F)',
        description: 'Standard Lime batch, primary fermentation ongoing.',
        batchCode: { code: 'LIME-001', parentCode: undefined, childCodes: [], lineage: ['LIME-001'] },
        batchNumber: 1,
        batchDate: fiveDaysAgo,
        batchType: BatchTypeEnum.enum['1F'],
        stage: StageEnum.enum['1F'],
        stageHistory: [
          { stage: StageEnum.enum['1F'], startTime: fiveDaysAgo, endTime: undefined, equipmentId: equipment[0].id, notes: 'Started 1F' }
        ],
        currentEquipmentId: equipment[0].id,
        equipmentHistory: [
          { equipmentId: equipment[0].id, startTime: fiveDaysAgo, endTime: undefined, notes: 'Started 1F' }
        ],
        parentBatchId: undefined,
        childBatchIds: [],
        splitPortions: [],
        measurements: {
          ph: [{ timestamp: fiveDaysAgo, value: 4.5, notes: 'Initial pH' }],
          temperature: [{ timestamp: fiveDaysAgo, value: 70, notes: 'Ambient temp' }]
        },
        checklists: [],
        flavoring: undefined,
        volume: 18,
        teaType: 'Black',
        sugarAmount: 18,
        starterAmount: 2,
        qualityNotes: [],
        recallStatus: undefined,
        finishingDetails: undefined,
        notes: 'Seeded active batch.'
      },
      {
        name: 'POG (Active 2F)',
        description: 'POG flavoring, secondary fermentation ongoing.',
        batchCode: { code: 'POG-002A', parentCode: 'POG-002', childCodes: [], lineage: ['POG-002', 'POG-002A'] },
        batchNumber: 2,
        batchDate: tenDaysAgo,
        batchType: BatchTypeEnum.enum['2F'],
        stage: StageEnum.enum['2F'],
        stageHistory: [
          { stage: StageEnum.enum['1F'], startTime: twelveDaysAgo, endTime: tenDaysAgo, equipmentId: 'TEMP_OLD_EQUIP_ID_EXAMPLE', notes: 'Parent 1F (example)' },
          { stage: StageEnum.enum['2F'], startTime: tenDaysAgo, endTime: undefined, equipmentId: equipment[1].id, notes: 'Started 2F with POG' }
        ],
        currentEquipmentId: equipment[1].id,
        equipmentHistory: [
            { equipmentId: 'TEMP_OLD_EQUIP_ID_EXAMPLE', startTime: twelveDaysAgo, endTime: tenDaysAgo, notes: 'Parent 1F' },
            { equipmentId: equipment[1].id, startTime: tenDaysAgo, endTime: undefined, notes: 'Started 2F' }
        ],
        parentBatchId: undefined,
        childBatchIds: [],
        splitPortions: [],
        measurements: {
          ph: [
              { timestamp: tenDaysAgo, value: 3.8, notes: 'pH at start of 2F' },
              { timestamp: fiveDaysAgo, value: 3.5, notes: 'pH mid 2F' }
            ],
          temperature: [
              { timestamp: tenDaysAgo, value: 72, notes: 'Ambient temp' }
            ]
        },
        checklists: [],
        flavoring: { ingredients: ['Passion Fruit Puree', 'Orange Juice', 'Guava Nectar'], addedAt: tenDaysAgo, notes: 'Standard POG mix' },
        volume: 4.5,
        teaType: 'Green',
        sugarAmount: 0.5,
        starterAmount: 0,
        qualityNotes: [ { ...sampleQualityNote1, batchId: 'TEMP_PLACEHOLDER' } ], 
        recallStatus: undefined,
        finishingDetails: undefined,
        notes: 'Seeded active 2F batch.'
      },
    ];

    const createdBatches: Batch[] = [];
    for (const batchInput of batchesData) {
      try {
          // Clone input data to avoid mutation issues if reused
          const dataToCreate = { ...batchInput };
          
          // If this batch definition has quality notes, update their batchId placeholder
          // BEFORE passing to create
          if (dataToCreate.qualityNotes && dataToCreate.qualityNotes.length > 0) {
              // We know the batch ID *before* creation because we set it deterministically
              // (This assumes batchRepository.create doesn't generate its own ID like BaseRepository)
              // If BatchRepository *does* generate an ID, this approach needs rethink.
              // Let's assume for now BatchRepository uses the ID provided if available, or generates one.
              // However, BatchSchema requires an ID. BaseRepository GENERATES the ID.
              // So we CANNOT know the batchId beforehand.
              
              // ---> REVISED LOGIC NEEDED HERE <--- 
              // We must create the batch first, THEN add/update quality notes with the correct batchId.
              // Let's simplify: create batches WITHOUT quality notes first.
              
              const batchDataWithoutNotes = { ...dataToCreate };
              delete batchDataWithoutNotes.qualityNotes; // Remove notes before creation
              
              const dataWithMeta = { 
                ...batchDataWithoutNotes, 
                createdBy: userId, 
                lastModifiedBy: userId 
              };
              
              const created = await this.batchRepository.create(dataWithMeta, userId); 
              
              // Now, if original data HAD notes, associate them (this assumes BatchRepo doesn't handle this)
              if (batchInput.qualityNotes && batchInput.qualityNotes.length > 0) {
                  const notesToAdd = batchInput.qualityNotes.map(note => ({...note, batchId: created.id }));
                  // We need a way to ADD these notes. Does BatchRepository have an `addQualityNote` or similar?
                  // Or does the QualityRepository handle this? Let's assume QualityRepository.
                  // If QualityRepository is used, we don't need the `id` in the sample note either.
                  console.warn('TODO: Implement adding quality notes via QualityRepository after batch creation');
                  // Example call (assuming QualityRepository.addQualityNote exists):
                  // for (const note of notesToAdd) {
                  //   await this.qualityRepository.addQualityNote(note as Omit<QualityNote, 'id'>); 
                  // }
                  // For now, push the created batch without notes until note saving is implemented
                  createdBatches.push(created); 
              } else {
                 createdBatches.push(created);
              }
          } else {
              // No quality notes for this batch definition
              const dataWithMeta = { 
                  ...dataToCreate, 
                  createdBy: userId, 
                  lastModifiedBy: userId 
              };
              const created = await this.batchRepository.create(dataWithMeta, userId); 
              createdBatches.push(created);
          }

      } catch (error) {
          console.error('Error creating batch:', error, batchInput);
      }
    }
    console.log(`Seeded ${createdBatches.length} batch items.`);
    return createdBatches;
  }
  
  private async seedQualityChecks(userId: string, batches: Batch[]): Promise<void> {
      console.log('Seeding quality checks...');
      if (batches.length === 0) {
        console.log('Skipping quality check seeding, no batches provided.');
        return;
      }
      const now = Date.now();
      const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);

      const checksData: Omit<QualityCheck, 'id' | 'createdAt' | 'updatedAt'>[] = [
          {
              batchId: batches[0].id,
              timestamp: threeDaysAgo,
              type: QualityCheckTypeEnum.enum.PH,
              value: 4.0,
              unit: 'pH',
              notes: 'Routine pH check during 1F',
              status: QualityCheckStatusEnum.enum.PASS,
              createdBy: userId,
              updatedBy: userId
          },
          {
              batchId: batches[1].id,
              timestamp: threeDaysAgo,
              type: QualityCheckTypeEnum.enum.TASTE,
              value: undefined,
              unit: undefined,
              notes: 'Good POG flavor developing, slightly tart.',
              status: QualityCheckStatusEnum.enum.PASS,
              createdBy: userId,
              updatedBy: userId
          },
          {
              batchId: batches[1].id,
              timestamp: now,
              type: QualityCheckTypeEnum.enum.VISUAL,
              value: undefined,
              unit: undefined,
              notes: 'Unusual sediment observed at bottom of fermenter.',
              status: QualityCheckStatusEnum.enum.FAIL,
              createdBy: userId,
              updatedBy: userId
          }
      ];
      
      let seededCount = 0;
      for (const checkData of checksData) {
          try {
              await this.qualityRepository.addQualityCheck(checkData);
              seededCount++;
          } catch(error) {
              console.error("Error seeding quality check:", error, checkData);
          }
      }
      console.log(`Seeded ${seededCount} quality check items.`);
  }
} 