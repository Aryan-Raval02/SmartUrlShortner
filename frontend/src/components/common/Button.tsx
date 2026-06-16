import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: `
    background: linear-gradient(135deg, #6c63ff, #7d75ff);
    color: #fff;
    border: 1px solid transparent;
    box-shadow: 0 0 20px rgba(108, 99, 255, 0.25);
  `,
  secondary: `
    background: rgba(0, 212, 170, 0.1);
    color: #00d4aa;
    border: 1px solid rgba(0, 212, 170, 0.2);
  `,
  ghost: `
    background: rgba(255,255,255,0.04);
    color: #f0f0f5;
    border: 1px solid rgba(255,255,255,0.08);
  `,
  danger: `
    background: rgba(255, 107, 107, 0.15);
    color: #ff6b6b;
    border: 1px solid rgba(255,107,107,0.25);
  `,
  outline: `
    background: transparent;
    color: #6c63ff;
    border: 1px solid #6c63ff;
  `,
};

const sizeStyles = {
  sm: 'padding: 6px 14px; font-size: 13px; border-radius: 8px;',
  md: 'padding: 10px 20px; font-size: 14px; border-radius: 10px;',
  lg: 'padding: 14px 28px; font-size: 16px; border-radius: 12px;',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 500,
        fontFamily: 'inherit',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'all 250ms ease',
        opacity: isDisabled ? 0.6 : 1,
        width: fullWidth ? '100%' : undefined,
        ...(style as object),
      }}
      {...props}
    >
      {loading && (
        <span
          style={{
            width: 16,
            height: 16,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      )}
      {!loading && leftIcon && leftIcon}
      {children}
      {!loading && rightIcon && rightIcon}
    </button>
  );
};

export default Button;
