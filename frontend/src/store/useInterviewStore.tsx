import { create } from 'zustand';

interface InterviewState {
  sessionId: string | null;
  setSessionId: (id: string) => void;
  role: string;
  setRole: (role: string) => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),
  role: 'Frontend Developer',
  setRole: (role) => set({ role }),
}));