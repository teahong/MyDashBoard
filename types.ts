export interface Task {
  id: string; // Firestore ID
  text: string;
  done: boolean;
  createdAt?: number;
  order?: number; // 정렬 순서
  userId?: string;
}

export interface Bookmark {
  id: string; // Firestore ID
  title: string;
  url: string;
  description?: string;
  iconName?: string; // Lucide icon name
  imageUrl?: string; // Deprecated, kept for backward compatibility or future use
  createdAt?: number;
  order?: number; // 정렬 순서
  userId?: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

// Type definition for Google Apps Script run API
export interface GoogleScriptRun {
  withSuccessHandler: (callback: (result: any) => void) => GoogleScriptRun;
  withFailureHandler: (callback: (error: any) => void) => GoogleScriptRun;
  [key: string]: any;
}

declare global {
  interface Window {
    google?: {
      script: {
        run: GoogleScriptRun;
      };
    };
  }
}