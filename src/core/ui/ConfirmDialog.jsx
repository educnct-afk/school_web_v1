import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({
        title: opts.title ?? 'Are you sure?',
        description: opts.description ?? null,
        confirmLabel: opts.confirmLabel ?? 'Confirm',
        cancelLabel: opts.cancelLabel ?? 'Cancel',
        tone: opts.tone ?? 'danger',
        loading: false,
      });
    });
  }, []);

  const close = (result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <Modal
          open
          onClose={() => close(false)}
          title={state.title}
          size="sm"
          footer={
            <>
              <Button variant="outline" onClick={() => close(false)}>{state.cancelLabel}</Button>
              <Button variant={state.tone === 'danger' ? 'danger' : 'primary'} onClick={() => close(true)}>
                {state.confirmLabel}
              </Button>
            </>
          }
        >
          <div className="flex gap-3">
            {state.tone === 'danger' && (
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 grid place-items-center shrink-0">
                <AlertTriangle size={20} />
              </div>
            )}
            {state.description && <p className="text-sm text-ink-700 dark:text-ink-100/90">{state.description}</p>}
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within <ConfirmProvider>');
  return ctx;
}
