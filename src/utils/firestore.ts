
import { Simulation } from '@/types/simulation';

// Mock implementation for now - replace with actual Firebase integration
let mockSimulations: Simulation[] = [];

export const saveSimulation = async (simulation: Simulation): Promise<void> => {
  // Mock save - in real implementation, this would save to Firestore
  mockSimulations.unshift(simulation);
  
  // Save to localStorage as fallback
  try {
    const existing = localStorage.getItem('cyberRiskSimulations');
    const simulations = existing ? JSON.parse(existing) : [];
    simulations.unshift(simulation);
    localStorage.setItem('cyberRiskSimulations', JSON.stringify(simulations.slice(0, 50))); // Keep last 50
  } catch (error) {
    console.error('Failed to save simulation to localStorage:', error);
  }
  
  console.log('Simulation saved:', simulation);
};

export const getSimulations = async (userId?: string): Promise<Simulation[]> => {
  // Mock fetch - in real implementation, this would fetch from Firestore
  try {
    const existing = localStorage.getItem('cyberRiskSimulations');
    if (existing) {
      const simulations = JSON.parse(existing);
      return simulations.map((sim: any) => ({
        ...sim,
        timestamp: new Date(sim.timestamp)
      }));
    }
  } catch (error) {
    console.error('Failed to load simulations from localStorage:', error);
  }
  
  return mockSimulations;
};

export const deleteSimulation = async (simulationId: string): Promise<void> => {
  // Mock delete - in real implementation, this would delete from Firestore
  mockSimulations = mockSimulations.filter(sim => sim.id !== simulationId);
  
  try {
    const existing = localStorage.getItem('cyberRiskSimulations');
    if (existing) {
      const simulations = JSON.parse(existing);
      const filtered = simulations.filter((sim: any) => sim.id !== simulationId);
      localStorage.setItem('cyberRiskSimulations', JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Failed to delete simulation from localStorage:', error);
  }
};

// Firebase configuration would go here in a real implementation
/*
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  // Your config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const saveSimulation = async (simulation: Simulation): Promise<void> => {
  try {
    await addDoc(collection(db, 'simulations'), simulation);
  } catch (error) {
    console.error('Error saving simulation:', error);
    throw error;
  }
};

export const getSimulations = async (userId?: string): Promise<Simulation[]> => {
  try {
    const q = query(
      collection(db, 'simulations'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Simulation));
  } catch (error) {
    console.error('Error fetching simulations:', error);
    throw error;
  }
};
*/
