import PlaceholderPage from '../components/PlaceholderPage';

const UnauthorizedPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] p-8">
    <div className="w-full max-w-lg">
      <PlaceholderPage
        title="Access denied"
        phase="Phase 5"
        description="403 — your role does not have permission to view this page."
      />
    </div>
  </div>
);

export default UnauthorizedPage;
