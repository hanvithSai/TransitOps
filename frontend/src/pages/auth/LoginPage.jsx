import PlaceholderPage from '../../components/PlaceholderPage';

const LoginPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] p-8">
    <div className="w-full max-w-lg">
      <PlaceholderPage
        title="Sign in"
        phase="Phase 5"
        description="Authentication form — login, session restore, and redirect."
      />
    </div>
  </div>
);

export default LoginPage;
