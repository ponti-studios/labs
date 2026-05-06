export type FragmentType = 'text' | 'voice' | 'image' | 'link' | 'suggestion';

export interface ThoughtFragment {
  id: string;
  type: FragmentType;
  content: string; // Text content, transcript, or base64 data
  timestamp: number;
  metadata?: {
    mimeType?: string;
    duration?: number;
    suggestionType?: string;
    isDraft?: boolean;
  };
}

export interface IntentState {
  isRecording: boolean;
  isCameraActive: boolean;
  isProcessing: boolean;
  currentText: string;
}
