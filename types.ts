
export interface Script {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface Settings {
  speed: number;
  fontSize: number;
  fontFamily: 'sans' | 'serif';
  textColor: string;
  backgroundColor: string;
  isMirrored: boolean;
}

export type View = 'library' | 'editor' | 'prompter';