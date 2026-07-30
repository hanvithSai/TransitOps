export const PageHeader = ({ icon: Icon, title, subtitle, action }) => (
  <div className="app-page-header">
    <div className="app-page-header-main">
      {Icon && (
        <div className="app-page-header-icon" aria-hidden="true">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <h1 className="text-h1">{title}</h1>
        {subtitle && <p className="app-page-header-subtitle text-body">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="app-page-header-action shrink-0">{action}</div>}
  </div>
);
