import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import {
  BACKEND_STATUS,
  getBackendStatus,
  subscribeBackendStatus,
  warmBackend,
} from '../../services/api';

const STATUS_CONFIG = {
  [BACKEND_STATUS.CHECKING]: {
    icon: Loader2,
    iconClass: 'animate-spin',
    message: 'Connecting to server — this can take up to a minute after idle time.',
    className: 'backend-status-banner--checking',
  },
  [BACKEND_STATUS.SLOW]: {
    icon: Loader2,
    iconClass: 'animate-spin',
    message: 'Server is responding slowly. Retrying your request…',
    className: 'backend-status-banner--slow',
  },
  [BACKEND_STATUS.OFFLINE]: {
    icon: WifiOff,
    iconClass: '',
    message: 'Cannot reach the server. Check your connection or try again shortly.',
    className: 'backend-status-banner--offline',
    showRetry: true,
  },
};

const BackendStatusBanner = () => {
  const [status, setStatus] = useState(getBackendStatus());
  const [retrying, setRetrying] = useState(false);

  useEffect(() => subscribeBackendStatus(setStatus), []);

  if (status === BACKEND_STATUS.ONLINE) return null;

  const config = STATUS_CONFIG[status] || STATUS_CONFIG[BACKEND_STATUS.OFFLINE];
  const Icon = config.icon;

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await warmBackend();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      className={`backend-status-banner ${config.className}`}
      role="status"
      aria-live="polite"
    >
      <Icon className={`h-4 w-4 shrink-0 ${config.iconClass}`} aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">{config.message}</p>
      {config.showRetry && (
        <button
          type="button"
          onClick={handleRetry}
          disabled={retrying}
          className="backend-status-banner-action"
        >
          {retrying ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Retry
            </>
          )}
        </button>
      )}
      {status === BACKEND_STATUS.CHECKING && (
        <AlertCircle className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
      )}
    </div>
  );
};

export default BackendStatusBanner;
