import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableTagProps {
    id: string;
    children: React.ReactNode;
    data?: any;
}

export const SortableTag: React.FC<SortableTagProps> = ({ id, children, data }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id, data });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1, // Hide original when dragging (the overlay will show)
        position: 'relative',
        touchAction: 'none',
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
};
