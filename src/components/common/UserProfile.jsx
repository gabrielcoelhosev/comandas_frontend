import { Badge, Logout } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getGrupoInfo } from '../../constants/userGroups';
import Button from '../ui/Button';

const UserProfile = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const grupoInfo = getGrupoInfo(user?.grupo);
  const avatarContent = user?.nome ? user.nome.charAt(0).toUpperCase() : 'U';

  const handleLogout = () => {
    onClose();
    logout();
  };

  if (!open) return null;

  return (
    <div className="profile-menu">
      <div className="profile-menu__summary">
        <span className="avatar">{avatarContent}</span>
        <div>
          <p className="profile-menu__name">{user?.nome || 'Usuário'}</p>
          {user?.cpf && <p className="profile-menu__cpf">{user.cpf}</p>}
        </div>
      </div>

      <div className="card__content" style={{ padding: '8px 10px' }}>
        <span className="badge" data-variant={grupoInfo.color === 'success' ? 'success' : 'muted'}>
          <Badge fontSize="small" />
          {grupoInfo.label}
        </span>
      </div>

      <div className="card__footer" style={{ padding: '8px 10px 10px' }}>
        <Button variant="destructive" size="sm" onClick={handleLogout}>
          <Logout fontSize="small" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
