import { useEffect, useCallback } from 'react';

export interface KeyboardShortcuts {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      
      // Build key combo string
      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push('ctrl');
      if (e.shiftKey) parts.push('shift');
      if (e.altKey) parts.push('alt');
      parts.push(key);
      const keyCombo = parts.join('+');

      // Check for exact match first (with modifiers)
      if (shortcuts[keyCombo]) {
        e.preventDefault();
        shortcuts[keyCombo]();
        return;
      }

      // Check for key only (without modifiers) - but only if no modifiers were pressed
      if (!e.ctrlKey && !e.metaKey && !e.altKey && shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

