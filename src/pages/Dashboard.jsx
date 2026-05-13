import { Typography, Box } from "@mui/material";
import PageLayout from "../components/common/PageLayout";
const Dashboard = () => {
  return <PageLayout title="Dashboard" maxWidth="xl">
            <Box sx={{
      mb: 4
    }}>
                <Typography variant="h4" sx={{
        fontWeight: 700,
        mb: 1
      }}>
                    Bem-vindo ao Comandas do Zé, feito por Gabriel!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {`Data: ${new Date().toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`}
                </Typography>
            </Box>

                        <Box sx={{
      display: "flex",
      justifyContent: "center",
      mt: 4
    }}>
                <img src="/Minhafoto.jpeg" alt="Foto do Gabriel" style={{
        width: "220px",
        borderRadius: "16px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
      }} />
            </Box>

        </PageLayout>;
};
export default Dashboard;
