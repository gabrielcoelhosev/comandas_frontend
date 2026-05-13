import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { TextField, Button, Box, Typography, Paper, Avatar } from "@mui/material";
import { RestaurantMenu as MenuIcon } from '@mui/icons-material';
import useValidationRules from "../../hooks/useValidationRules";
const LoginForm = () => {
  const validationRules = useValidationRules();
  const {
    control,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm();
  const {
    login
  } = useAuth();
  const onSubmit = data => {
    const {
      cpf,
      senha
    } = data;
    login(cpf, senha);
  };
  return <Box sx={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2
  }}>
            <Paper elevation={8} sx={{
      p: 4,
      maxWidth: 400,
      width: '100%',
      borderRadius: 3,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)'
    }}>
                <Box sx={{
        textAlign: 'center',
        mb: 4
      }}>
                    <Avatar sx={{
          width: 64,
          height: 64,
          bgcolor: '#f59e0b',
          mx: 'auto',
          mb: 2
        }}>
                        <MenuIcon sx={{
            fontSize: 32
          }} />
                    </Avatar>
                    <Typography variant="h4" component="h1" sx={{
          fontWeight: 700,
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          mb: 1
        }}>
                        Comandas do Zé
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Faça login para acessar o sistema
                    </Typography>
                </Box>

                
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Controller name="cpf" control={control} defaultValue="" rules={validationRules.cpf} render={({
          field
        }) => <TextField {...field} fullWidth label="Usuário" margin="normal" error={!!errors.cpf} helperText={errors.cpf?.message} sx={{
          mb: 2
        }} />} />
                    <Controller name="senha" control={control} defaultValue="" rules={validationRules.senha} render={({
          field
        }) => <TextField {...field} fullWidth label="Senha" type="password" margin="normal" error={!!errors.senha} helperText={errors.senha?.message} sx={{
          mb: 3
        }} />} />
                    <Button type="submit" variant="contained" fullWidth size="large" sx={{
          py: 1.5,
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          }
        }}>
                        Entrar
                    </Button>
                </Box>

            </Paper>
        </Box>;
};
export default LoginForm;
