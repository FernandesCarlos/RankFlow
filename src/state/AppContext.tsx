
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockProfile } from '../mocks';
import type { Training } from '../services/forms';

const initialNotifications = {
  allowed: true,
  weekly: true,
  contest: true,
  score: true,
  result: true,
  friends: false,
  invites: true,
  quiet: true,
};

export type CompletedTraining = Training & {
  id: string;
  completedAt: string;
  results: {
    participant: string;
    solved: number;
    points: number;
  }[];
};

type Notice = {
  message: string;
  tone: 'success' | 'info' | 'danger';
} | null;

type PersistedAppState = {
  profile?: Partial<typeof mockProfile>;
  notifications?: Partial<typeof initialNotifications>;
  publicProfile?: boolean;
  trainingHistory?: CompletedTraining[];
};

const STORAGE_KEY = '@rankflow:app-state:v1';

function useAppState() {
  const [authenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState({ ...mockProfile });
  const [notifications, setNotifications] = useState(initialNotifications);
  const [publicProfile, setPublicProfile] = useState(true);
  const [training, setTraining] = useState<Training | null>(null);
  const [trainingHistory, setTrainingHistory] = useState<CompletedTraining[]>([]);
  const [completedTrainingId, setCompletedTrainingId] = useState<string | null>(null);

  const [verifiedHandle, setVerifiedHandle] = useState('');
  const [verificationOrigin, setVerificationOrigin] = useState<'cadastro' | 'plataformas'>('cadastro');
  const [notice, setNotice] = useState<Notice>(null);

  // Indica se o carregamento inicial terminou.
  const [hydrated, setHydrated] = useState(false);
  
  function deleteTraining(id: string) {
    setTrainingHistory(current =>
      current.filter(item => item.id !== id)
    );

    if (completedTrainingId === id) {
      setCompletedTrainingId(null);
    }
  }
  

  // Recupera os dados salvos ao abrir o aplicativo.
  useEffect(() => {
    async function loadData() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved) {
          const data: PersistedAppState = JSON.parse(saved);

          if (data.profile) {
            setProfile({
              ...mockProfile,
              ...data.profile,
            });
          }

          if (data.notifications) {
            setNotifications({
              ...initialNotifications,
              ...data.notifications,
            });
          }

          if (typeof data.publicProfile === 'boolean') {
            setPublicProfile(data.publicProfile);
          }

          if (Array.isArray(data.trainingHistory)) {
            setTrainingHistory(data.trainingHistory);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados locais:', error);
      } finally {
        setHydrated(true);
      }
    }
    
    loadData();
  }, 
  
  []);

  // Salva os dados quando algum estado persistido mudar.
  useEffect(() => {
    if (!hydrated) return;

    const data: PersistedAppState = {
      profile,
      notifications,
      publicProfile,
      trainingHistory,
    };

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(error => {
      console.error('Erro ao salvar dados locais:', error);
    });
  }, [hydrated, profile, notifications, publicProfile, trainingHistory]);

  function startTraining(value: Training) {
    setTraining(value);
    setCompletedTrainingId(null);
  }

  function completeTraining() {
    if (!training || completedTrainingId) return;

    const id = `${Date.now()}-${trainingHistory.length + 1}`;

    const completed: CompletedTraining = {
      ...training,
      id,
      completedAt: new Date().toISOString(),
      results: training.participants.map((participant, index) => {
        const solved = Math.max(0, training.problems.length - index);

        return {
          participant,
          solved,
          points: solved * 100,
        };
      }),
    };

    setTrainingHistory(current => [completed, ...current]);
    setCompletedTrainingId(id);
  }

  function signOut() {
    setAuthenticated(false);
    setProfile({ ...mockProfile });
    setNotifications(initialNotifications);
    setPublicProfile(true);
    setTraining(null);
    setTrainingHistory([]);
    setCompletedTrainingId(null);
    setVerifiedHandle('');
    setVerificationOrigin('cadastro');

    setNotice({
      message: 'Você saiu da sessão.',
      tone: 'info',
    });
  }

  return {
    authenticated,
    setAuthenticated,
    profile,
    setProfile,
    notifications,
    setNotifications,
    publicProfile,
    setPublicProfile,
    deleteTraining,
    training,
    setTraining: startTraining,
    trainingHistory,
    completedTrainingId,
    completeTraining,
    verifiedHandle,
    setVerifiedHandle,
    verificationOrigin,
    setVerificationOrigin,
    notice,
    setNotice,
    signOut,
  };
}

const AppContext = createContext<ReturnType<typeof useAppState> | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AppContext.Provider value={useAppState()}>
      {children}
    </AppContext.Provider>
  );
}



export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider.');
  }

  return context;
}
