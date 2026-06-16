import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {label && (
          <label
            htmlFor={id}
            style={{ fontSize: '13px', fontWeight: 500, color: '#8888aa', letterSpacing: '0.02em' }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftIcon && (
            <span
              style={{
                position: 'absolute', left: '12px', color: '#555566',
                display: 'flex', alignItems: 'center', pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${error ? '#ff6b6b' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '10px',
              padding: `10px ${rightIcon ? '40px' : '14px'} 10px ${leftIcon ? '40px' : '14px'}`,
              color: '#f0f0f5',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 200ms ease, box-shadow 200ms ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#6c63ff';
              e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? '#ff6b6b' : 'rgba(255,255,255,0.08)';
              e.target.style.boxShadow = 'none';
            }}
            {...props}
          />
          {rightIcon && (
            <span style={{ position: 'absolute', right: '12px', color: '#555566', display: 'flex', alignItems: 'center' }}>
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p style={{ fontSize: '12px', color: '#ff6b6b', marginTop: '2px' }}>{error}</p>}
        {hint && !error && <p style={{ fontSize: '12px', color: '#555566' }}>{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
