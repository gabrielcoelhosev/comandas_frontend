import { CardDescription, CardTitle } from '../ui/Card';

const ListToolbar = ({ icon, title, description, actions }) => (
  <div className="list-toolbar">
    <div className="list-toolbar__title">
      {icon}
      <div>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </div>
    </div>
    {actions && <div className="toolbar-actions">{actions}</div>}
  </div>
);

export default ListToolbar;
