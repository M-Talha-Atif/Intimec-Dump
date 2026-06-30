
import { useState, useEffect } from 'react';

export const useScrollSpy = (itemIds: string[], topOffset = 0): string | null => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + topOffset;

      let activeSectionId: string | undefined;
      for (let i = itemIds.length - 1; i >= 0; i--) {
        const id = itemIds[i];
        const element = document.getElementById(id);
        if (element && element.offsetTop <= scrollPosition) {
          activeSectionId = id;
          break;
        }
      }

      setActiveId(activeSectionId || null);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on mount

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [itemIds, topOffset]);

  return activeId;
};
