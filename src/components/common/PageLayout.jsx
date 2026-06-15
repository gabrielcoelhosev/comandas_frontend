import { Card, CardContent } from '../ui/Card';

const maxWidthMap = {
  sm: '720px',
  md: '900px',
  lg: '1120px',
  xl: '1240px',
};

const PageLayout = ({
  children,
  title,
  description,
  actions,
  maxWidth = 'lg',
}) => (
  <section className="page" style={{ maxWidth: maxWidthMap[maxWidth] || maxWidth, margin: '0 auto' }}>
    <header className="page-header">
      <div className="page-header__content">
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>

    <Card elevated>
      <CardContent>{children}</CardContent>
    </Card>
  </section>
);

export default PageLayout;
