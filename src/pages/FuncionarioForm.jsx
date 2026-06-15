import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageLayout from '../components/common/PageLayout';
import IMaskInputWrapper from '../components/common/IMaskInputWrapper';
import Button from '../components/ui/Button';
import Dialog from '../components/ui/Dialog';
import FormField, { SelectField } from '../components/ui/FormField';
import { checkCpfExists, createFuncionario, getFuncionarioById, updateFuncionario } from '../services/funcionarioService';

const grupoOptions = [
  { value: '1', label: 'Admin' },
  { value: '2', label: 'Atendimento Balcão' },
  { value: '3', label: 'Atendimento Caixa' },
];

const FuncionarioForm = () => {
  const { id, opr } = useParams();
  const [showCpfModal, setShowCpfModal] = useState(false);
  const [cpfDuplicado, setCpfDuplicado] = useState(null);
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();
  const isReadOnly = opr === 'view';
  const title = opr === 'view' ? `Visualizar Funcionário: ${id}` : id ? `Editar Funcionário: ${id}` : 'Novo Funcionário';

  useEffect(() => {
    if (!id) return;

    const fetchFuncionario = async () => {
      const data = await getFuncionarioById(id);
      reset(data);
    };

    fetchFuncionario();
  }, [id, reset]);

  const handleCpfBlur = async () => {
    const cpf = watch('cpf');
    if (!cpf || cpf.length < 11) return;

    try {
      const { exists, funcionario } = await checkCpfExists(cpf);
      const isSameFuncionario = Boolean(id) && funcionario?.id_funcionario === parseInt(id, 10);

      if (exists && !isSameFuncionario) {
        setCpfDuplicado(funcionario);
        setShowCpfModal(true);
      }
    } catch (error) {
      console.error('Erro ao verificar CPF:', error);
      toast.error('Erro ao verificar CPF');
    }
  };

  const onSubmit = async (data) => {
    try {
      const retorno = id ? await updateFuncionario(id, data) : await createFuncionario(data);

      if (!retorno || !retorno.id) {
        throw new Error(retorno.erro || 'Erro ao salvar Funcionário.');
      }

      toast.success(`Funcionário salvo com sucesso. ID: ${retorno.id}`, { position: 'top-center' });
      navigate('/funcionarios');
    } catch (error) {
      toast.error(`Erro ao salvar funcionário: \n${error.message}`, { position: 'top-center' });
    }
  };

  return (
    <PageLayout title={title} description={isReadOnly ? 'Todos os campos estão em modo somente leitura.' : 'Preencha os dados do funcionário.'} maxWidth="md">
      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <div className="span-2">
          <Controller
            name="nome"
            control={control}
            defaultValue=""
            rules={{ required: 'Nome é obrigatório' }}
            render={({ field }) => (
              <FormField {...field} disabled={isReadOnly} label="Nome" error={errors.nome?.message} />
            )}
          />
        </div>

        <Controller
          name="cpf"
          control={control}
          defaultValue=""
          rules={{ required: 'CPF é obrigatório' }}
          render={({ field }) => (
            <FormField
              {...field}
              disabled={isReadOnly}
              label="CPF"
              error={errors.cpf?.message}
              onBlur={handleCpfBlur}
              inputComponent={IMaskInputWrapper}
              inputProps={{ mask: '000.000.000-00', definitions: { 0: /\d/ }, unmask: true }}
            />
          )}
        />

        <Controller
          name="matricula"
          control={control}
          defaultValue=""
          rules={{ required: 'Matrícula é obrigatória' }}
          render={({ field }) => (
            <FormField {...field} disabled={isReadOnly} label="Matrícula" error={errors.matricula?.message} />
          )}
        />

        <Controller
          name="telefone"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormField
              {...field}
              disabled={isReadOnly}
              label="Telefone"
              error={errors.telefone?.message}
              inputComponent={IMaskInputWrapper}
              inputProps={{ mask: '(00) 00000-0000', definitions: { 0: /\d/ }, unmask: true }}
            />
          )}
        />

        <Controller
          name="grupo"
          control={control}
          defaultValue=""
          rules={{ required: 'Grupo é obrigatório' }}
          render={({ field }) => (
            <SelectField {...field} disabled={isReadOnly} label="Grupo" options={grupoOptions} error={errors.grupo?.message} />
          )}
        />

        <Controller
          name="senha"
          control={control}
          defaultValue=""
          rules={{
            required: id ? false : 'Senha obrigatória',
            minLength: { value: 6, message: 'Pelo menos 6 caracteres' },
          }}
          render={({ field }) => (
            <FormField {...field} disabled={isReadOnly} label="Senha" type="password" error={errors.senha?.message} />
          )}
        />

        <div className="span-2 form-actions" style={{ justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={() => navigate('/funcionarios')}>
            Cancelar
          </Button>
          {!isReadOnly && (
            <Button type="submit" variant="default">
              {id ? 'Atualizar' : 'Cadastrar'}
            </Button>
          )}
        </div>
      </form>

      <Dialog
        open={showCpfModal}
        title="CPF já cadastrado"
        onClose={() => setShowCpfModal(false)}
        actions={
          <>
            <Button variant="outline" onClick={() => setShowCpfModal(false)}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={() => navigate(`/funcionario/view/${cpfDuplicado.id_funcionario}`)}>
              Visualizar
            </Button>
            <Button variant="default" onClick={() => navigate(`/funcionario/edit/${cpfDuplicado.id_funcionario}`)}>
              Editar
            </Button>
          </>
        }
      >
        <p>Este CPF já está vinculado a outro funcionário.</p>
      </Dialog>
    </PageLayout>
  );
};

export default FuncionarioForm;
