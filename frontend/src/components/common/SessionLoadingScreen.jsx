import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { BACKEND_STATUS, getBackendStatus, subscribeBackendStatus } from '../../services/api';

const LOADING_MESSAGES = {
  [BACKEND_STATUS.CHECKING]: 'Connecting to server…',
  [BACKEND_STATUS.SLOW]: 'Server is waking up — almost there…',
  [BACKEND_STATUS.OFFLINE]: 'Waiting for server…',
  [BACKEND_STATUS.ONLINE]: 'Loading…',
};

const SessionLoadingScreen = () => {
  const [status, setStatus] = useState(getBackendStatus());

  useEffect(() => subscribeBackendStatus(setStatus), []);

  const message = LOADING_MESSAGES[status] || LOADING_MESSAGES[BACKEND_STATUS.ONLINE];

  return (
    <div className="flex h-screen items-center justify-center bg-[var(--bg-base)]">
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <Loader2
          className="h-10 w-10 animate-spin text-[var(--color-brand-600)]"
          aria-hidden="true"
        />
        <p className="text-sm text-[var(--text-secondary)]">{message}</p>
        {(status === BACKEND_STATUS.CHECKING || status === BACKEND_STATUS.SLOW) && (
          <p className="max-w-sm text-caption text-[var(--text-muted)]">
            Free-tier servers can take up to a minute to start after being idle.
          </p>
        )}
      </div>
    </div>
  );
};

export default SessionLoadingScreen;
