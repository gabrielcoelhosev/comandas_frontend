import { Delete, Edit, Visibility } from '@mui/icons-material';
import Button from '../ui/Button';

const ActionButtons = ({ item, onView, onEdit, onDelete }) => (
  <div className="row-actions">
    {onView && (
      <Button size="icon" variant="outline" title="Visualizar" onClick={() => onView(item)}>
        <Visibility fontSize="small" />
      </Button>
    )}
    {onEdit && (
      <Button size="icon" variant="secondary" title="Editar" onClick={() => onEdit(item)}>
        <Edit fontSize="small" />
      </Button>
    )}
    {onDelete && (
      <Button size="icon" variant="destructive" title="Excluir" onClick={() => onDelete(item)}>
        <Delete fontSize="small" />
      </Button>
    )}
  </div>
);

export default ActionButtons;
