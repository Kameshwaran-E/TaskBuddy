import { useState, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import type { DroppableProps } from '@hello-pangea/dnd';

export const StrictModeDroppable = ({
  children,
  droppableId,
  type,
  ...props
}: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable droppableId={droppableId} type={type} {...props}>{children}</Droppable>;
}; 