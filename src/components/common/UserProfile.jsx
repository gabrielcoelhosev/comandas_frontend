import {
  Avatar,
  Box,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { AccountCircle, Badge, Logout } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getGrupoInfo } from '../../constants/userGroups';

const UserProfile = ({ anchorEl, onClose }) => {
  const { user, logout } = useAuth();
  const open = Boolean(anchorEl);
  const grupoInfo = getGrupoInfo(user?.grupo);
  const avatarContent = user?.nome ? user.nome.charAt(0).toUpperCase() : <AccountCircle />;

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Box sx={{ px: 2, py: 1.5, minWidth: 240 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#f59e0b' }}>{avatarContent}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {user?.nome || 'Usuário'}
            </Typography>
            {user?.cpf && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.cpf}
              </Typography>
            )}
          </Box>
        </Box>

        <Chip
          size="small"
          color={grupoInfo.color}
          label={grupoInfo.label}
          sx={{ mt: 1.5 }}
        />
      </Box>

      <Divider />

      <MenuItem disabled>
        <ListItemIcon>
          <Badge fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Perfil" />
      </MenuItem>

      <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
        <ListItemIcon sx={{ color: 'error.main' }}>
          <Logout fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Sair" />
      </MenuItem>
    </Menu>
  );
};

export default UserProfile;
