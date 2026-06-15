import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageLayout from '../components/common/PageLayout';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import { useValidationRules } from '../hooks/useValidationRules';
import { createProduto, getProdutoById, updateProduto } from '../services/produtoService';

const ProdutoForm = () => {
  const { id, opr } = useParams();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const validationRules = useValidationRules();
  const navigate = useNavigate();
  const isReadOnly = opr === 'view';
  const title = opr === 'view' ? `Visualizar Produto: ${id}` : id ? `Editar Produto: ${id}` : 'Novo Produto';

  useEffect(() => {
    if (!id) return;

    const fetchProduto = async () => {
      try {
        const data = await getProdutoById(id);
        reset(data);
      } catch (error) {
        toast.error(`Erro ao buscar produto: ${error.apiMessage || error.message}`, {
          position: 'top-center',
        });
      }
    };

    fetchProduto();
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      const retorno = id ? await updateProduto(id, data) : await createProduto(data);

      toast.success(`Produto salvo com sucesso. ID: ${retorno.id}`, { position: 'top-center' });
      navigate('/produtos');
    } catch (error) {
      toast.error(`Erro ao salvar produto: ${error.apiMessage || error.message}`, {
        position: 'top-center',
      });
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      toast.info('Foto selecionada. O backend atual recebe a foto apenas como campo JSON opcional.', {
        position: 'top-center',
      });
    }
  };

  return (
    <PageLayout title={title} description={isReadOnly ? 'Produto em modo somente leitura.' : 'Cadastre nome, descrição e valor do item.'} maxWidth="md">
      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <div className="span-2">
          <Controller
            name="nome"
            control={control}
            defaultValue=""
            rules={validationRules.nome}
            render={({ field }) => (
              <FormField {...field} disabled={isReadOnly} label="Nome" error={errors.nome?.message} />
            )}
          />
        </div>

        <div className="span-2">
          <Controller
            name="descricao"
            control={control}
            defaultValue=""
            rules={validationRules.descricao}
            render={({ field }) => (
              <FormField
                {...field}
                disabled={isReadOnly}
                label="Descrição"
                multiline
                error={errors.descricao?.message}
              />
            )}
          />
        </div>

        <Controller
          name="valor_unitario"
          control={control}
          defaultValue=""
          rules={validationRules.valor_unitario}
          render={({ field }) => (
            <FormField
              {...field}
              disabled={isReadOnly}
              label="Valor Unitário"
              type="number"
              step="0.01"
              min="0"
              error={errors.valor_unitario?.message}
            />
          )}
        />

        {!isReadOnly && (
          <div className="field-group">
            <span className="field-label">Foto do Produto</span>
            <input id="foto-upload" className="sr-only" type="file" accept="image/*" onChange={handleFileChange} />
            <Button as="label" htmlFor="foto-upload" variant="outline">
              <PhotoCameraIcon />
              Selecionar Foto
            </Button>
            <span className="field-error" />
          </div>
        )}

        <div className="span-2 form-actions" style={{ justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={() => navigate('/produtos')}>
            Cancelar
          </Button>
          {!isReadOnly && (
            <Button type="submit" variant="default">
              {id ? 'Atualizar' : 'Cadastrar'}
            </Button>
          )}
        </div>
      </form>
    </PageLayout>
  );
};

export default ProdutoForm;
