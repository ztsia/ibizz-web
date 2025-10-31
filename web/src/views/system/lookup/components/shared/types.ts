import type { Component } from 'vue';

/**
 * Shared types for lookup/settings UI components.
 *
 * This file defines lightweight TypeScript interfaces used by the shared
 * components in `components/shared/*`. No runtime code is emitted from this
 * file — it exists purely for developer ergonomics and static typing.
 */
/**
 * SettingsCategory represents a single lookup/settings category card.
 */
export interface SettingsCategory {
  /** Unique identifier (kebab-case slug) */
  id: string;
  /** Display title (1-48 chars) */
  title: string;
  /** Optional description (0-120 chars) */
  description?: string;
  /** Material Design Icon token (mdi-*) */
  icon?: string | Component;
  /** Optional accent color */
  color?:
    | 'primary'
    | 'secondary'
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'grey';
}

/** Responsive column configuration for CardGrid */
export interface CardGridCols {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: string | Component;
  color?:
    | 'primary'
    | 'secondary'
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'grey';
  disabled?: boolean;
}

export interface CardGridProps {
  items: SettingsCategory[];
  cols?: CardGridCols;
  dense?: boolean;
}

export {};
