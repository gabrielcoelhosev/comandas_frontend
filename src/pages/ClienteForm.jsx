import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageLayout from '../components/common/PageLayout';
import IMaskInputWrapper from '../components/common/IMaskInputWrapper';
import Button from '../components/ui/Button';
import Dialog from '../components/ui/Dialog';
import FormField from '../components/ui/FormField';
import { checkCpfExists, createCliente, getClienteById, updateCliente } from '../services/clienteService';

const ClienteForm = () => {
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
  const title = opr === 'view' ? `Visualizar Cliente: ${id}` : id ? `Editar Cliente: ${id}` : 'Novo Cliente';

  useEffect(() => {
    if (!id) return;

    const fetchCliente = async () => {
      const data = await getClienteById(id);
      reset(data);
    };

    fetchCliente();
  }, [id, reset]);

  const handleCpfBlur = async () => {
    const cpf = watch('cpf');
    if (!cpf || cpf.length < 11) return;

    try {
      const { exists, cliente } = await checkCpfExists(cpf);
      const isSameCliente = Boolean(id) && cliente?.id_cliente === parseInt(id, 10);

      if (exists && !isSameCliente) {
        setCpfDuplicado(cliente);
        setShowCpfModal(true);
      }
    } catch (error) {
      console.error('Erro ao verificar CPF:', error);
      toast.error('Erro ao verificar CPF');
    }
  };

  const onSubmit = async (data) => {
    try {
      const retorno = id ? await updateCliente(id, data) : await createCliente(data);

      if (!retorno || !retorno.id) {
        throw new Error(retorno.erro || 'Erro ao salvar Cliente.');
      }

      toast.success(`Cliente salvo com sucesso. ID: ${retorno.id}`, { position: 'top-center' });
      navigate('/clientes');
    } catch (error) {
      toast.error(`Erro ao salvar cliente: \n${error.message}`, { position: 'top-center' });
    }
  };

  return (
    <PageLayout title={title} description={isReadOnly ? 'Todos os campos estão em modo somente leitura.' : 'Preencha os dados do cliente.'} maxWidth="md">
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

        <div className="span-2 form-actions" style={{ justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={() => navigate('/clientes')}>
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
            <Button variant="outline" onClick={() => navigate(`/cliente/view/${cpfDuplicado.id_cliente}`)}>
              Visualizar
            </Button>
            <Button variant="default" onClick={() => navigate(`/cliente/edit/${cpfDuplicado.id_cliente}`)}>
              Editar
            </Button>
          </>
        }
      >
        <p>Este CPF já está vinculado a outro cliente.</p>
      </Dialog>
    </PageLayout>
  );
};

export default ClienteForm;
