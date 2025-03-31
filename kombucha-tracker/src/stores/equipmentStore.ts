/**
 * Store for managing equipment state
 */

import { create } from 'zustand';
import { Equipment } from '../schemas/equipment';
import { Container, ContainerStatusEnum } from '../schemas/container';
import { EquipmentService } from '../services/equipmentService';
import { useAuth } from '../services/auth';
import { z } from 'zod';

// Keep derived enum type locally for parameter hints
type ContainerStatus = z.infer<typeof ContainerStatusEnum>;

interface EquipmentState {
  equipment: Equipment[];
  containers: Container[];
  isLoading: boolean;
  error: string | null;
  selectedEquipment: Equipment | null;
  selectedContainer: Container | null;

  // Actions
  fetchEquipment: () => Promise<void>;
  fetchContainers: () => Promise<void>;
  addEquipment: (equipment: Omit<Equipment, 'id' | 'metadata'>) => Promise<void>;
  updateEquipment: (id: string, updates: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  addContainer: (container: Omit<Container, 'id' | 'metadata'>) => Promise<void>;
  updateContainerStatus: (containerId: string, status: z.infer<typeof ContainerStatusEnum>, batchId?: string) => Promise<void>;
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

  fetchEquipment: async () => {
    const { user } = useAuth.getState();
    if (!user) {
      set({ error: 'User not authenticated', isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const equipmentService = EquipmentService.getInstance();
      equipmentService.initialize(user.uid);
      const equipment = await equipmentService.getEquipment();
      set({ equipment, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchContainers: async () => {
    const { user } = useAuth.getState();
    if (!user) {
      set({ error: 'User not authenticated', isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const equipmentService = EquipmentService.getInstance();
      equipmentService.initialize(user.uid);
      const containers = await equipmentService.getContainers();
      set({ containers, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addEquipment: async (equipment) => {
    const { user } = useAuth.getState();
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const equipmentService = EquipmentService.getInstance();
      equipmentService.initialize(user.uid);
      const newEquipment = await equipmentService.addEquipment(equipment);
      set(state => ({
        equipment: [...state.equipment, newEquipment],
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateEquipment: async (id, updates) => {
    const { user } = useAuth.getState();
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const equipmentService = EquipmentService.getInstance();
      equipmentService.initialize(user.uid);
      await equipmentService.updateEquipment(id, updates);
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
    const { user } = useAuth.getState();
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    const originalEquipment = [...get().equipment];
    set(state => ({
      equipment: state.equipment.filter(eq => eq.id !== id),
      selectedEquipment: state.selectedEquipment?.id === id ? null : state.selectedEquipment,
    }));

    set({ isLoading: true, error: null });
    try {
      const equipmentService = EquipmentService.getInstance();
      equipmentService.initialize(user.uid);
      await equipmentService.deleteEquipment(id);
      set({ isLoading: false });
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
        equipment: originalEquipment
      });
    }
  },

  addContainer: async (container) => {
    const { user } = useAuth.getState();
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const equipmentService = EquipmentService.getInstance();
      equipmentService.initialize(user.uid);
      const newContainer = await equipmentService.addContainer(container);
      set(state => ({
        containers: [...state.containers, newContainer],
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateContainerStatus: async (containerId, status, batchId) => {
    const { user } = useAuth.getState();
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    const originalContainers = [...get().containers];
    const originalSelected = get().selectedContainer ? {...get().selectedContainer} : null;
    set(state => ({
        containers: state.containers.map(container =>
            container.id === containerId
            ? { ...container, status: { ...container.status, current: status, lastUpdated: Date.now(), currentBatchId: batchId || null } }
            : container
        ),
        selectedContainer: state.selectedContainer?.id === containerId
            ? { ...state.selectedContainer, status: { ...state.selectedContainer.status, current: status, lastUpdated: Date.now(), currentBatchId: batchId || null } }
            : state.selectedContainer,
    }));

    set({ isLoading: true, error: null });
    try {
      const equipmentService = EquipmentService.getInstance();
      equipmentService.initialize(user.uid);
      await equipmentService.updateContainerStatus(containerId, status, batchId);
      set({ isLoading: false });
    } catch (error) {
      set({ 
          error: (error as Error).message, 
          isLoading: false, 
          containers: originalContainers,
          selectedContainer: originalSelected
        });
    }
  },

  setSelectedEquipment: (equipment) => {
    set({ selectedEquipment: equipment });
  },

  setSelectedContainer: (container) => {
    set({ selectedContainer: container });
  }
})); 