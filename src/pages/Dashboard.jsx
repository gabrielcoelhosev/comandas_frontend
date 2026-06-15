import PageLayout from '../components/common/PageLayout';
import { Card } from '../components/ui/Card';

const Dashboard = () => {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <PageLayout title="Dashboard" description="Visão geral do sistema de comandas" maxWidth="xl">
      <div className="dashboard-grid">
        <div className="welcome-panel">
          <span className="badge">Atendimento</span>
          <h2>Bem-vindo ao Comandas do Zé, feito por Gabriel!</h2>
          <p>{`Data: ${today}`}</p>
        </div>

        <Card className="profile-photo-card" elevated>
          <img src="/Minhafoto.jpeg" alt="Foto do Gabriel" />
        </Card>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
