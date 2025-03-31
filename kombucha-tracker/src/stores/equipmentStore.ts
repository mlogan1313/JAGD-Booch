/**
 * Store for managing equipment state
 */

import { create } from 'zustand';
import { Equipment, Container, EquipmentSchedule } from '../types/equipment';
import { EquipmentService } from '../services/equipmentService';

interface EquipmentState {
  equipment: Equipment[];
  containers: Container[];
  isLoading: boolean;
  error: string | null;
  selectedEquipment: Equipment | null;
  selectedContainer: Container | null;
  equipmentSchedule: EquipmentSchedule[];
  
  // Actions
  fetchEquipment: () => Promise<void>;
  fetchContainers: () => Promise<void>;
  addEquipment: (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEquipment: (id: string, updates: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  addContainer: (container: Omit<Container, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContainerStatus: (containerId: string, status: Container['status'], batchId?: string) => Promise<void>;
  fetchEquipmentSchedule: (equipmentId: string, startDate: number, endDate: number) => Promise<void>;
  setSelectedEquipment: (equipment: Equipment | null) => void;
  setSelectedContainer: (container: Container | null) => void;
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  equipment: [],
  containers: [],
  isLoading: false,
  error: null,
  selectedEquipment: null,
  selectedContainer: null,
  equipmentSchedule: [],

  fetchEquipment: async () => {
    set({ isLoading: true, error: null });
    try {
      const equipment = await EquipmentService.getInstance().getEquipment();
      set({ equipment, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchContainers: async () => {
    set({ isLoading: true, error: null });
    try {
      const containers = await EquipmentService.getInstance().getContainers();
      set({ containers, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addEquipment: async (equipment) => {
    set({ isLoading: true, error: null });
    try {
      const newEquipment = await EquipmentService.getInstance().addEquipment(equipment);
      set(state => ({
        equipment: [...state.equipment, newEquipment],
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateEquipment: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await EquipmentService.getInstance().updateEquipment(id, updates);
      set(state => ({
        equipment: state.equipment.map(eq => 
          eq.id === id ? { ...eq, ...updates } : eq
        ),
        selectedEquipment: state.selectedEquipment?.id === id 
          ? { ...state.selectedEquipment, ...updates }
          : state.selectedEquipment,
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteEquipment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await EquipmentService.getInstance().deleteEquipment(id);
      set(state => ({
        equipment: state.equipment.filter(eq => eq.id !== id),
        selectedEquipment: state.selectedEquipment?.id === id ? null : state.selectedEquipment,
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addContainer: async (container) => {
    set({ isLoading: true, error: null });
    try {
      const newContainer = await EquipmentService.getInstance().addContainer(container);
      set(state => ({
        containers: [...state.containers, newContainer],
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateContainerStatus: async (containerId, status, batchId) => {
    set({ isLoading: true, error: null });
    try {
      await EquipmentService.getInstance().updateContainerStatus(containerId, status, batchId);
      set(state => ({
        containers: state.containers.map(container => 
          container.id === containerId 
            ? { 
                ...container, 
                status,
                currentBatchId: status === 'FILLED' ? batchId : undefined,
                fillDate: status === 'FILLED' ? Date.now() : container.fillDate,
                emptyDate: status === 'EMPTY' ? Date.now() : container.emptyDate
              }
            : container
        ),
        selectedContainer: state.selectedContainer?.id === containerId
          ? { ...state.selectedContainer, status }
          : state.selectedContainer,
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchEquipmentSchedule: async (equipmentId, startDate, endDate) => {
    set({ isLoading: true, error: null });
    try {
      const schedule = await EquipmentService.getInstance().getEquipmentSchedule(
        equipmentId,
        startDate,
        endDate
      );
      set({ equipmentSchedule: schedule, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setSelectedEquipment: (equipment) => {
    set({ selectedEquipment: equipment });
  },

  setSelectedContainer: (container) => {
    set({ selectedContainer: container });
  }
})); 