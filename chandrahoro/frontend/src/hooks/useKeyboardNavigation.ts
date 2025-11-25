import { useEffect, useCallback, useRef } from 'react';

interface KeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: (event: KeyboardEvent) => void;
  onShiftTab?: (event: KeyboardEvent) => void;
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export const useKeyboardNavigation = (options: KeyboardNavigationOptions = {}) => {
  const {
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    enabled = true,
    preventDefault = false,
    stopPropagation = false
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onEscape();
        }
        break;
      case 'Enter':
        if (onEnter) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onEnter();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onArrowRight();
        }
        break;
      case 'Tab':
        if (event.shiftKey && onShiftTab) {
          onShiftTab(event);
        } else if (onTab) {
          onTab(event);
        }
        break;
    }
  }, [
    enabled,
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    preventDefault,
    stopPropagation
  ]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return { handleKeyDown };
};

// Hook for managing focus within a container
export const useFocusManagement = () => {
  const containerRef = useRef<HTMLElement>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])'
    ].join(', ');

    return Array.from(containerRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
    }
  }, [getFocusableElements]);

  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
    }
  }, [getFocusableElements]);

  const focusNext = useCallback(() => {
    const elements = getFocusableElements();
    const currentIndex = elements.findIndex(el => el === document.activeElement);
    
    if (currentIndex >= 0 && currentIndex < elements.length - 1) {
      elements[currentIndex + 1].focus();
    } else if (elements.length > 0) {
      elements[0].focus(); // Wrap to first
    }
  }, [getFocusableElements]);

  const focusPrevious = useCallback(() => {
    const elements = getFocusableElements();
    const currentIndex = elements.findIndex(el => el === document.activeElement);
    
    if (currentIndex > 0) {
      elements[currentIndex - 1].focus();
    } else if (elements.length > 0) {
      elements[elements.length - 1].focus(); // Wrap to last
    }
  }, [getFocusableElements]);

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const firstElement = elements[0];
    const lastElement = elements[elements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [getFocusableElements]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    trapFocus,
    getFocusableElements
  };
};

// Hook for modal/dialog keyboard navigation
export const useModalKeyboardNavigation = (
  isOpen: boolean,
  onClose?: () => void,
  autoFocus = true
) => {
  const { containerRef, focusFirst, trapFocus } = useFocusManagement();
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the first element in the modal
      if (autoFocus) {
        setTimeout(() => focusFirst(), 0);
      }
    } else {
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, autoFocus, focusFirst]);

  useKeyboardNavigation({
    onEscape: onClose,
    onTab: trapFocus,
    enabled: isOpen
  });

  return { containerRef };
};

// Hook for dropdown/menu keyboard navigation
export const useMenuKeyboardNavigation = (
  isOpen: boolean,
  onClose?: () => void,
  onSelect?: (index: number) => void
) => {
  const { containerRef, getFocusableElements } = useFocusManagement();
  const currentIndex = useRef(0);

  const focusItem = useCallback((index: number) => {
    const elements = getFocusableElements();
    if (elements[index]) {
      elements[index].focus();
      currentIndex.current = index;
    }
  }, [getFocusableElements]);

  const focusNextItem = useCallback(() => {
    const elements = getFocusableElements();
    const nextIndex = (currentIndex.current + 1) % elements.length;
    focusItem(nextIndex);
  }, [focusItem]);

  const focusPreviousItem = useCallback(() => {
    const elements = getFocusableElements();
    const prevIndex = currentIndex.current === 0 ? elements.length - 1 : currentIndex.current - 1;
    focusItem(prevIndex);
  }, [focusItem]);

  const selectCurrentItem = useCallback(() => {
    if (onSelect) {
      onSelect(currentIndex.current);
    }
  }, [onSelect]);

  useKeyboardNavigation({
    onEscape: onClose,
    onArrowDown: focusNextItem,
    onArrowUp: focusPreviousItem,
    onEnter: selectCurrentItem,
    enabled: isOpen,
    preventDefault: true
  });

  return { containerRef, focusItem };
};

export default useKeyboardNavigation;
