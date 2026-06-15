import { ArrowBack, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import Button from '../components/ui/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <PageLayout title="404 - Página não encontrada" maxWidth="md">
      <div className="empty-state" style={{ minHeight: 320 }}>
        <div>
          <p style={{ color: 'var(--secondary)', fontSize: '4rem', fontWeight: 900, margin: 0 }}>404</p>
          <h2 style={{ margin: '8px 0 6px' }}>Esta rota não existe no sistema</h2>
          <p style={{ maxWidth: 560 }}>
            O endereço informado não foi encontrado. Verifique a URL ou retorne para uma área válida do sistema Comandas.
          </p>
          <div className="form-actions" style={{ justifyContent: 'center', marginTop: 18 }}>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowBack />
              Voltar
            </Button>
            <Button variant="default" onClick={() => navigate('/home')}>
              <Home />
              Página inicial
            </Button>
          </div>
          <p style={{ marginTop: 18, fontSize: '0.8rem' }}>Gabriel Coelho Severino</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
