import { Delete, PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageLayout from '../components/common/PageLayout';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import { useValidationRules } from '../hooks/useValidationRules';
import { createProduto, getProdutoById, updateProduto } from '../services/produtoService';

const MAX_PHOTO_LENGTH = 60000;
const MAX_PHOTO_EDGE = 420;
const MIN_PHOTO_EDGE = 160;

const compressImageToDataUrl = file => new Promise((resolve, reject) => {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);

  image.onload = () => {
    URL.revokeObjectURL(objectUrl);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      reject(new Error('Nao foi possivel preparar a imagem.'));
      return;
    }

    let maxEdge = MAX_PHOTO_EDGE;

    while (maxEdge >= MIN_PHOTO_EDGE) {
      const ratio = Math.min(1, maxEdge / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      for (let quality = 0.78; quality >= 0.42; quality -= 0.12) {
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        if (dataUrl.length <= MAX_PHOTO_LENGTH) {
          resolve(dataUrl);
          return;
        }
      }

      maxEdge = Math.round(maxEdge * 0.8);
    }

    reject(new Error('A foto ficou grande demais para salvar. Tente uma imagem mais simples ou menor.'));
  };

  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('Nao foi possivel carregar a foto selecionada.'));
  };

  image.src = objectUrl;
});

const ProdutoForm = () => {
  const { id, opr } = useParams();
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();
  const validationRules = useValidationRules();
  const navigate = useNavigate();
  const isReadOnly = opr === 'view';
  const title = opr === 'view' ? `Visualizar Produto: ${id}` : id ? `Editar Produto: ${id}` : 'Novo Produto';
  const foto = useWatch({ control, name: 'foto' });

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

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warn('Selecione um arquivo de imagem valido.', { position: 'top-center' });
      event.target.value = '';
      return;
    }

    const maxFileSizeInMb = 2;
    const maxFileSize = maxFileSizeInMb * 1024 * 1024;

    if (file.size > maxFileSize) {
      toast.warn(`A foto deve ter no maximo ${maxFileSizeInMb} MB.`, { position: 'top-center' });
      event.target.value = '';
      return;
    }

    try {
      const compressedPhoto = await compressImageToDataUrl(file);
      setValue('foto', compressedPhoto, { shouldDirty: true, shouldValidate: true });
      toast.success('Foto adicionada ao produto.', { position: 'top-center' });
    } catch (error) {
      toast.error(error.message, { position: 'top-center' });
    } finally {
      event.target.value = '';
    }
  };

  const handleRemoveFoto = () => {
    setValue('foto', null, { shouldDirty: true, shouldValidate: true });
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

        <div className="span-2">
          <Controller
            name="foto"
            control={control}
            defaultValue={null}
            render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />}
          />
        </div>

        <div className="field-group span-2">
          <span className="field-label">Foto do Produto</span>

          <div className="product-photo-field">
            {foto ? (
              <img className="product-photo-preview" src={foto} alt="Foto do produto" />
            ) : (
              <span className="product-photo-placeholder">
                <PhotoCameraIcon />
              </span>
            )}

            {!isReadOnly && (
              <div className="product-photo-actions">
                <input id="foto-upload" className="sr-only" type="file" accept="image/*" onChange={handleFileChange} />
                <Button as="label" htmlFor="foto-upload" variant="outline">
                  <PhotoCameraIcon />
                  {foto ? 'Trocar Foto' : 'Selecionar Foto'}
                </Button>

                {foto && (
                  <Button variant="outline" onClick={handleRemoveFoto}>
                    <Delete />
                    Remover
                  </Button>
                )}
              </div>
            )}
          </div>
          <span className="field-error" />
        </div>

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
