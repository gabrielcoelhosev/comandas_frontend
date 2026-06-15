import { RestaurantMenu as MenuIcon } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import useValidationRules from '../../hooks/useValidationRules';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import FormField from '../ui/FormField';

const LoginForm = () => {
  const validationRules = useValidationRules();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login } = useAuth();

  const onSubmit = ({ cpf, senha }) => {
    login(cpf, senha);
  };

  return (
    <section className="login-page">
      <Card className="login-card" elevated>
        <CardHeader>
          <div className="login-brand">
            <span className="login-brand__mark">
              <MenuIcon fontSize="large" />
            </span>
            <div>
              <h1>Comandas do Zé</h1>
              <p>Faça login para acessar o sistema</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
            <div className="span-2">
              <Controller
                name="cpf"
                control={control}
                defaultValue=""
                rules={validationRules.cpf}
                render={({ field }) => (
                  <FormField {...field} label="Usuário" error={errors.cpf?.message} />
                )}
              />
            </div>

            <div className="span-2">
              <Controller
                name="senha"
                control={control}
                defaultValue=""
                rules={validationRules.senha}
                render={({ field }) => (
                  <FormField {...field} label="Senha" type="password" error={errors.senha?.message} />
                )}
              />
            </div>

            <div className="span-2">
              <Button type="submit" variant="default" style={{ width: '100%' }}>
                Entrar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default LoginForm;
