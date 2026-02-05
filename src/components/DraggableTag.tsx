import React from 'react';
import { useDraggable } from '@dnd-kit/core';

interface DraggableTagProps {
    id: string;
    children: React.ReactNode;
    data?: any;
}

export const DraggableTag: React.FC<DraggableTagProps> = ({ id, children, data }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id,
        data
    });

    const style: React.CSSProperties = {
        // transform: CSS.Translate.toString(transform), // Disable transform for source items to keep them in place
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        touchAction: 'none',
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {children}
        </div>
    );
};
