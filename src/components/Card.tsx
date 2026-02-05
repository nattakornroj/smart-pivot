import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hover = false, className, style, ...props }) => {
    const baseStyle: React.CSSProperties = {
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        transition: 'all 0.3s var(--ease-spring)',
        overflow: 'hidden',
        position: 'relative',
        ...style
    };

    return (
        <div
            className={`glass-panel ${className || ''}`}
            style={baseStyle}
            {...props}
            onMouseEnter={(e) => {
                if (hover) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px var(--accent-glow)';
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }
            }}
            onMouseLeave={(e) => {
                if (hover) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                }
            }}
        >
            {/* Subtle Gradient Overlay */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, height: '2px',
                background: 'var(--surface-gradient)',
                opacity: 0.5,
                pointerEvents: 'none'
            }} />

            {children}
        </div>
    );
};
