import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { subscribeDemoMode, isDemoMode } from '../services/api';

const DemoModeBanner = () => {
  const [active, setActive] = useState(isDemoMode());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => subscribeDemoMode(setActive), []);

  if (!active || dismissed) return null;

  return (
    <div className="demo-banner" role="status">
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">
        Demo mode — backend unavailable. Showing mock data; changes are not persisted.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="demo-banner-dismiss"
        aria-label="Dismiss demo mode banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default DemoModeBanner;
