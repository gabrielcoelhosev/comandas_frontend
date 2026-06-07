import { Box, Button, Typography } from "@mui/material";
import { ArrowBack, Home } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/common/PageLayout";

const NotFound = () => {
  const navigate = useNavigate();

  return <PageLayout title="404 - Página não encontrada">
            <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 320,
      textAlign: 'center',
      gap: 2,
      px: 2
    }}>
                <Typography variant="h2" component="p" sx={{
        fontWeight: 800,
        color: 'secondary.main',
        lineHeight: 1
      }}>
                    404
                </Typography>

                <Typography variant="h5" component="h2" sx={{
        fontWeight: 700,
        color: 'text.primary'
      }}>
                    Esta rota não existe no sistema
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{
        maxWidth: 560
      }}>
                    O endereço informado não foi encontrado. Verifique a URL ou retorne para uma área válida do sistema Comandas.
                </Typography>

                <Box sx={{
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        justifyContent: 'center',
        mt: 1
      }}>
                    <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
                        Voltar
                    </Button>
                    <Button variant="contained" startIcon={<Home />} onClick={() => navigate('/home')}>
                        Página inicial
                    </Button>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{
        mt: 2
      }}>
                    Gabriel Coelho Severino
                </Typography>
            </Box>
        </PageLayout>;
};

export default NotFound;
