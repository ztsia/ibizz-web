export interface TimelineStep {
  id: number;
  title: string;
  description: string;
  details: string[];
  hasProgress?: boolean;
  progressKey?: string;
}

export interface TimelineConfig {
  stepTimings: number[];
  progressConfigs?: {
    [key: string]: {
      increment: number;
      interval: number;
    };
  };
  autoCollapseDelay?: number;
}

export type ColorTheme =
  | 'green'
  | 'blue'
  | 'yellow'
  | 'red'
  | 'orange'
  | 'purple'
  | 'teal'
  | 'indigo';
