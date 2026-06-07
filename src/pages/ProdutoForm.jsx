import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, InputLabel } from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageLayout from "../components/common/PageLayout";
import { useValidationRules } from '../hooks/useValidationRules';
import { createProduto, getProdutoById, updateProduto } from '../services/produtoService';

const ProdutoForm = () => {
  const { id, opr } = useParams();
  const {
    control,
    handleSubmit,
    reset,
    formState: {
      errors
    }
  } = useForm();
  const validationRules = useValidationRules();
  const navigate = useNavigate();
  const isReadOnly = opr === 'view';

  useEffect(() => {
    if (!id) return;

    const fetchProduto = async () => {
      try {
        const data = await getProdutoById(id);
        reset(data);
      } catch (error) {
        toast.error(`Erro ao buscar produto: ${error.apiMessage || error.message}`, {
          position: "top-center"
        });
      }
    };

    fetchProduto();
  }, [id, reset]);

  const onSubmit = async data => {
    try {
      const retorno = id ? await updateProduto(id, data) : await createProduto(data);

      toast.success(`Produto salvo com sucesso. ID: ${retorno.id}`, {
        position: "top-center"
      });
      navigate('/produtos');
    } catch (error) {
      toast.error(`Erro ao salvar produto: ${error.apiMessage || error.message}`, {
        position: "top-center"
      });
    }
  };

  const handleFileChange = event => {
    const file = event.target.files[0];
    if (file) {
      toast.info('Foto selecionada. O backend atual recebe a foto apenas como campo JSON opcional.', {
        position: "top-center"
      });
    }
  };

  const handleCancel = () => {
    navigate('/produtos');
  };

  const title = opr === 'view' ? `Visualizar Produto: ${id}` : id ? `Editar Produto: ${id}` : 'Novo Produto';

  return <PageLayout title={title}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Controller name="nome" control={control} defaultValue="" rules={validationRules.nome} render={({
        field
      }) => <TextField {...field} disabled={isReadOnly} label="Nome" fullWidth margin="normal" error={!!errors.nome} helperText={errors.nome?.message} />} />

                <Controller name="descricao" control={control} defaultValue="" rules={validationRules.descricao} render={({
        field
      }) => <TextField {...field} disabled={isReadOnly} label="Descricao" fullWidth margin="normal" multiline rows={3} error={!!errors.descricao} helperText={errors.descricao?.message} />} />

                <Controller name="valor_unitario" control={control} defaultValue="" rules={validationRules.valor_unitario} render={({
        field
      }) => <TextField {...field} disabled={isReadOnly} label="Valor Unitario" fullWidth margin="normal" type="number" inputProps={{
        step: "0.01",
        min: "0"
      }} error={!!errors.valor_unitario} helperText={errors.valor_unitario?.message} />} />

                {!isReadOnly && <Box sx={{
        mt: 2,
        mb: 2
      }}>
                    <InputLabel htmlFor="foto-upload" sx={{
          mb: 1
        }}>
                        Foto do Produto
                    </InputLabel>
                    <input id="foto-upload" type="file" accept="image/*" onChange={handleFileChange} style={{
          display: 'none'
        }} />
                    <label htmlFor="foto-upload">
                        <Button variant="outlined" component="span" startIcon={<PhotoCameraIcon />} fullWidth>
                            Selecionar Foto
                        </Button>
                    </label>
                </Box>}

                <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        mt: 3
      }}>
                    <Button sx={{
          mr: 1
        }} onClick={handleCancel}>
                        Cancelar
                    </Button>
                    {!isReadOnly && <Button type="submit" variant="contained">
                        {id ? "Atualizar" : "Cadastrar"}
                    </Button>}
                </Box>
            </Box>
        </PageLayout>;
};

export default ProdutoForm;
