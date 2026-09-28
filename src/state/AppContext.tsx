import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { mockProfile } from '../mocks';
import type { Training } from '../services/forms';

const initialNotifications = { allowed: true, weekly: true, contest: true, score: true, result: true, friends: false, invites: true, quiet: true };
export type CompletedTraining = Training & { id: string; completedAt: string; results: { participant: string; solved: number; points: number }[] };
type Notice = { message: string; tone: 'success' | 'info' | 'danger' } | null;
function useAppState() {
  const [authenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState({ ...mockProfile });
  const [notifications, setNotifications] = useState(initialNotifications);
  const [publicProfile, setPublicProfile] = useState(true);
  const [training, setTraining] = useState<Training | null>(null);
  const [trainingHistory, setTrainingHistory] = useState<CompletedTraining[]>([]);
  const [completedTrainingId, setCompletedTrainingId] = useState<string | null>(null);
  function startTraining(value: Training) {
    setTraining(value);
    setCompletedTrainingId(null);
  }
  function completeTraining() {
    if (!training || completedTrainingId) return;
    const id = `${Date.now()}-${trainingHistory.length + 1}`;
    const completed: CompletedTraining = {
      ...training, id, completedAt: new Date().toISOString(),
      results: training.participants.map((participant, index) => {
        const solved = Math.max(0, training.problems.length - index);
        return { participant, solved, points: solved * 100 };
      }),
    };
    setTrainingHistory(current => [completed, ...current]);
    setCompletedTrainingId(id);
  }
  const [verifiedHandle, setVerifiedHandle] = useState('');
  const [verificationOrigin, setVerificationOrigin] = useState<'cadastro' | 'plataformas'>('cadastro');
  const [notice, setNotice] = useState<Notice>(null);
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
    setNotice({ message: 'Você saiu da sessão de demonstração.', tone: 'info' });
  }
  return { authenticated, setAuthenticated, profile, setProfile, notifications, setNotifications,
    publicProfile, setPublicProfile, training, setTraining: startTraining, trainingHistory, completedTrainingId, completeTraining, verifiedHandle, setVerifiedHandle,
    verificationOrigin, setVerificationOrigin, notice, setNotice, signOut };
}
const AppContext = createContext<ReturnType<typeof useAppState> | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  return <AppContext.Provider value={useAppState()}>{children}</AppContext.Provider>;
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de AppProvider.');
  return context;
}
