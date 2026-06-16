import { useToastStore } from '../../store/useToastStore';

type ToastType = 'success' | 'error' | 'info' | 'warning';

const colors: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: { bg: 'rgba(0,212,170,0.1)', border: 'rgba(0,212,170,0.3)', text: '#00d4aa' },
  error: { bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)', text: '#ff6b6b' },
  info: { bg: 'rgba(108,99,255,0.1)', border: 'rgba(108,99,255,0.3)', text: '#7d75ff' },
  warning: { bg: 'rgba(255,179,71,0.1)', border: 'rgba(255,179,71,0.3)', text: '#ffb347' },
};

const icons: Record<ToastType, string> = {
  success: '✓', error: '✕', info: 'ℹ', warning: '⚠',
};

export const Toast = ({ id, type, message }: { id: string; type: ToastType; message: string }) => {
  const removeToast = useToastStore((s) => s.removeToast);
  const { bg, border, text } = colors[type];

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: bg, border: `1px solid ${border}`,
        borderRadius: '10px', padding: '12px 16px',
        minWidth: '280px', maxWidth: '360px',
        backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.3s ease',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <span style={{ color: text, fontWeight: 700, fontSize: '16px' }}>{icons[type]}</span>
      <span style={{ color: '#f0f0f5', fontSize: '14px', flex: 1 }}>{message}</span>
      <button
        onClick={() => removeToast(id)}
        style={{ color: '#555566', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
      >
        ×
      </button>
    </div>
  );
};
