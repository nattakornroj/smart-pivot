import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    style,
    disabled,
    ...props
}) => {
    const baseStyles: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 600,
        transition: 'all 0.3s var(--ease-spring)',
        gap: '0.5rem',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
    };

    const variants = {
        primary: {
            background: 'var(--accent-gradient)',
            color: 'white',
            boxShadow: '0 4px 16px var(--accent-glow)',
            border: 'none',
        },
        secondary: {
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-highlight)',
        },
        ghost: {
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: 'none',
        }
    };

    const sizes = {
        sm: { padding: '0.35rem 0.85rem', fontSize: '0.875rem' },
        md: { padding: '0.6rem 1.25rem', fontSize: '1rem' },
        lg: { padding: '0.85rem 2rem', fontSize: '1.125rem' },
    };

    const combinedStyles = {
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
        ...style
    };

    return (
        <button
            style={combinedStyles}
            disabled={disabled}
            {...props}
            onMouseEnter={(e) => {
                if (!disabled) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    if (variant === 'primary') e.currentTarget.style.filter = 'brightness(1.1)';
                    if (variant === 'secondary') e.currentTarget.style.background = 'var(--bg-card-hover)';
                    if (variant === 'ghost') e.currentTarget.style.color = 'var(--text-primary)';
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.filter = 'none';
                    if (variant === 'secondary') e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    if (variant === 'ghost') e.currentTarget.style.color = 'var(--text-secondary)';
                }
            }}
        >
            {children}
        </button>
    );
};
