import {
  Close,
  Dashboard,
  Group,
  Logout,
  Menu as MenuIcon,
  People,
  PointOfSale,
  Receipt,
  RestaurantMenu,
} from '@mui/icons-material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserProfile from './UserProfile';

const menuItems = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/home' },
  { label: 'Funcionários', icon: <People />, path: '/funcionarios' },
  { label: 'Clientes', icon: <Group />, path: '/clientes' },
  { label: 'Produtos', icon: <RestaurantMenu />, path: '/produtos' },
  { label: 'Comandas', icon: <Receipt />, path: '/comandas' },
  { label: 'Caixa', icon: <PointOfSale />, path: '/caixa' },
  { label: 'Recebimentos', icon: <Receipt />, path: '/recebimentos' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const avatarContent = user?.nome ? user.nome.charAt(0).toUpperCase() : 'U';

  const goTo = (path) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  const renderNavLink = (item) => (
    <button
      className={`nav-link ${location.pathname === item.path ? 'is-active' : ''}`}
      key={item.path}
      onClick={() => goTo(item.path)}
      type="button"
    >
      {item.icon}
      <span>{item.label}</span>
    </button>
  );

  return (
    <nav className="site-nav">
      <div className="site-nav__inner">
        <button className="brand nav-link" type="button" onClick={() => navigate(isAuthenticated ? '/home' : '/login')}>
          <span className="brand__mark">
            <RestaurantMenu />
          </span>
          <span className="brand__text">Comandas do Zé</span>
        </button>

        {isAuthenticated && (
          <div className="nav-actions">
            <div className="desktop-nav">{menuItems.map(renderNavLink)}</div>

            <button className="avatar-button" type="button" onClick={() => setProfileOpen((open) => !open)} title="Perfil">
              <span className="avatar">{avatarContent}</span>
            </button>

            <button className="nav-icon-button desktop-nav" type="button" onClick={logout} title="Sair">
              <Logout />
            </button>

            <button
              className="nav-icon-button mobile-menu-trigger"
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              title="Abrir menu"
            >
              <MenuIcon />
            </button>
          </div>
        )}
      </div>

      <div className={`mobile-drawer ${mobileDrawerOpen ? 'is-open' : ''}`} onMouseDown={() => setMobileDrawerOpen(false)}>
        <aside className="mobile-drawer__panel" onMouseDown={(event) => event.stopPropagation()}>
          <div className="mobile-drawer__header">
            <strong>Menu</strong>
            <button className="button" data-size="icon" data-variant="ghost" type="button" onClick={() => setMobileDrawerOpen(false)}>
              <Close />
            </button>
          </div>
          <div className="mobile-nav">{menuItems.map(renderNavLink)}</div>
        </aside>
      </div>

      <UserProfile open={profileOpen} onClose={() => setProfileOpen(false)} />
    </nav>
  );
};

export default Navbar;
