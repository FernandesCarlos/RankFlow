import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
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

const defaultProfile = {
  name: '',
  firstName: '',
  username: '',
  email: '',
  initials: '',
  rank: '',
  rating: 0,
  maxRating: 0,
  problemsSolved: 0,
  streakDays: 0,
  contests: 0,
  bio: '',
  editBio: '',
  codeforcesHandle: '',
};

type PersistedAppState = {
  profile?: Partial<typeof defaultProfile>;
  notifications?: Partial<typeof initialNotifications>;
  publicProfile?: boolean;
  trainingHistory?: CompletedTraining[];
  friendHandles?: string[];
};

const STORAGE_KEY = '@rankflow:app-state:v1';

function useAppState() {
  const [authenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState({ ...defaultProfile });
  const [notifications, setNotifications] = useState(initialNotifications);
  const [publicProfile, setPublicProfile] = useState(true);
  const [training, setTraining] = useState<Training | null>(null);
  const [trainingHistory, setTrainingHistory] = useState<CompletedTraining[]>([]);
  const [completedTrainingId, setCompletedTrainingId] = useState<string | null>(null);
  const [friendHandles, setFriendHandles] = useState<string[]>([]);

  const [verifiedHandle, setVerifiedHandle] = useState('');
  const [verificationOrigin, setVerificationOrigin] = useState<'cadastro' | 'plataformas'>('cadastro');
  const [notice, setNotice] = useState<Notice>(null);

  // Indica se o carregamento inicial terminou.
  const [hydrated, setHydrated] = useState(false);

  function addFriendHandle(handle: string) {
    const normalized = handle.trim();
    if (!normalized) return;
    setFriendHandles((current) =>
      current.some((item) => item.toLowerCase() === normalized.toLowerCase())
        ? current
        : [...current, normalized]
    );
  }

  function removeFriendHandle(handle: string) {
    setFriendHandles((current) =>
      current.filter((item) => item.toLowerCase() !== handle.toLowerCase())
    );
  }

  function deleteTraining(id: string) {
    setTrainingHistory(current => current.filter(item => item.id !== id));
    if (completedTrainingId === id) setCompletedTrainingId(null);
  }

  // Recupera os dados salvos ao abrir o aplicativo.
  useEffect(() => {
    async function loadData() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data: PersistedAppState = JSON.parse(saved);
          if (data.profile) {
            const restoredProfile = { ...defaultProfile, ...data.profile };
            const wasSeedProfile =
              data.profile.codeforcesHandle === 'FernandesCarlos' &&
              data.profile.email === 'carlos@email.com' &&
              data.profile.rating === 1482 &&
              data.profile.problemsSolved === 327;
            if (wasSeedProfile) {
              restoredProfile.codeforcesHandle = '';
              restoredProfile.rank = '';
              restoredProfile.rating = 0;
              restoredProfile.maxRating = 0;
              restoredProfile.problemsSolved = 0;
              restoredProfile.streakDays = 0;
              restoredProfile.contests = 0;
            }
            setProfile(restoredProfile);
          }
          if (data.notifications) {
            setNotifications({ ...initialNotifications, ...data.notifications });
          }
          if (typeof data.publicProfile === 'boolean') setPublicProfile(data.publicProfile);
          if (Array.isArray(data.trainingHistory)) {
            // Descarta históricos antigos gerados por treinos fictícios.
            const realTrainings = data.trainingHistory.filter((item) =>
              Array.isArray(item.problems) &&
              item.problems.length > 0 &&
              item.problems.every((problem) =>
                typeof problem.url === 'string' &&
                problem.url.startsWith('https://codeforces.com/problemset/problem/') &&
                typeof problem.contestId === 'number' &&
                typeof problem.index === 'string'
              )
            );
            setTrainingHistory(realTrainings);
          }
          if (Array.isArray(data.friendHandles)) {
            setFriendHandles([...new Set(data.friendHandles.filter((item) => typeof item === 'string' && item.trim()))]);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados locais:', error);
      } finally {
        setHydrated(true);
      }
    }
    loadData();
  }, []);

  // Salva os dados quando algum estado persistido mudar.
  useEffect(() => {
    if (!hydrated) return;
    const data: PersistedAppState = {
      profile,
      notifications,
      publicProfile,
      trainingHistory,
      friendHandles,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(error => {
      console.error('Erro ao salvar dados locais:', error);
    });
  }, [hydrated, profile, notifications, publicProfile, trainingHistory, friendHandles]);

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
      results: [],
    };
    setTrainingHistory(current => [completed, ...current]);
    setCompletedTrainingId(id);
  }

  function signOut() {
    setAuthenticated(false);
    setProfile({ ...defaultProfile });
    setNotifications(initialNotifications);
    setPublicProfile(true);
    setTraining(null);
    setTrainingHistory([]);
    setCompletedTrainingId(null);
    setFriendHandles([]);
    setVerifiedHandle('');
    setVerificationOrigin('cadastro');
    setNotice({ message: 'Você saiu da sessão.', tone: 'info' });
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
    friendHandles,
    addFriendHandle,
    removeFriendHandle,
    verifiedHandle,
    setVerifiedHandle,
    verificationOrigin,
    setVerificationOrigin,
    notice,
    setNotice,
    hydrated,
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
  if (!context) throw new Error('useApp deve ser usado dentro de AppProvider.');
  return context;
}
