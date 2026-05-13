import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, Typography, MenuItem, FormControl, InputLabel, Select, Toolbar } from '@mui/material';
import IMaskInputWrapper from '../components/common/IMaskInputWrapper';
import { createCliente, updateCliente, getClienteById, checkCpfExists } from '../services/clienteService';
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
const ClienteForm = () => {
  const {
    id,
    opr
  } = useParams();
  const [showCpfModal, setShowCpfModal] = useState(false);
  const [cpfDuplicado, setCpfDuplicado] = useState(null);
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: {
      errors
    }
  } = useForm();
  const isReadOnly = opr === 'view';
  let title;
  if (opr === 'view') {
    title = `Visualizar Cliente: ${id}`;
  } else if (id) {
    title = `Editar Cliente: ${id}`;
  } else {
    title = "Novo Cliente Gabriel";
  }
  useEffect(() => {
    if (id) {
      const fetchCliente = async () => {
        const data = await getClienteById(id);
        reset(data);
      };
      fetchCliente();
    }
  }, [id, reset]);
  const handleCpfBlur = async () => {
    const cpf = watch('cpf');
    if (!cpf || cpf.length < 11) return;
    try {
      const {
        exists,
        cliente
      } = await checkCpfExists(cpf);
      const isEditing = !!id;
      const isSameCliente = isEditing && cliente?.id_cliente === parseInt(id);
      if (exists && !isSameCliente) {
        setCpfDuplicado(cliente);
        setShowCpfModal(true);
      }
    } catch (error) {
      console.error('Erro ao verificar CPF:', error);
      toast.error('Erro ao verificar CPF');
    }
  };
  const handleViewDuplicate = () => {
    navigate(`/cliente/view/${cpfDuplicado.id_cliente}`);
    setShowCpfModal(false);
  };
  const handleEditDuplicate = () => {
    navigate(`/cliente/edit/${cpfDuplicado.id_cliente}`);
    setShowCpfModal(false);
  };
  const onSubmit = async data => {
    try {
      let retorno;
      if (id) {
        retorno = await updateCliente(id, data);
      } else {
        retorno = await createCliente(data);
      }
      if (!retorno || !retorno.id) {
        throw new Error(retorno.erro || "Erro ao salvar Cliente.");
      }
      toast.success(`Cliente salvo com sucesso. ID: ${retorno.id}`, {
        position: "top-center"
      });
      navigate('/clientes');
    } catch (error) {
      toast.error(`Erro ao salvar cliente: \n${error.message}`, {
        position: "top-center"
      });
    }
  };
  return <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{
    backgroundColor: '#ADD8E6',
    padding: 2,
    borderRadius: 1,
    mt: 2
  }}>

            <Toolbar sx={{
      backgroundColor: '#ADD8E6',
      padding: 1,
      borderRadius: 2,
      mb: 2,
      display: 'flex',
      justifyContent: 'space-between'
    }}>
                <Typography variant="h6" gutterBottom color="primary">{title}</Typography>
            </Toolbar>

            <Box sx={{
      backgroundColor: 'white',
      padding: 2,
      borderRadius: 3,
      mb: 2
    }}>

                {opr === 'view' && <Typography variant="body2" color="textSecondary" sx={{
        mb: 2
      }}>
                        Todos os campos estão em modo somente leitura.
                    </Typography>}

                <Controller name="nome" control={control} defaultValue="" rules={{
        required: "Nome é obrigatório"
      }} render={({
        field
      }) => <TextField {...field} disabled={isReadOnly} label="Nome" fullWidth margin='normal' error={!!errors.nome} helperText={errors.nome?.message} />} />

                
                <Controller name="cpf" control={control} defaultValue="" rules={{
        required: "CPF é obrigatório"
      }} render={({
        field
      }) => <TextField {...field} disabled={isReadOnly} label="CPF" fullWidth margin="normal" error={!!errors.cpf} helperText={errors.cpf?.message} onBlur={handleCpfBlur} InputProps={{
        inputComponent: IMaskInputWrapper,
        inputProps: {
          mask: "000.000.000-00",
          definitions: {
            "0": /\d/
          },
          unmask: true
        }
      }} />} />
                
                
                <Controller name="telefone" control={control} defaultValue="" render={({
        field
      }) => <TextField {...field} disabled={isReadOnly} label="Telefone" fullWidth margin="normal" error={!!errors.telefone} helperText={errors.telefone?.message} InputProps={{
        inputComponent: IMaskInputWrapper,
        inputProps: {
          mask: "(00) 00000-0000",
          definitions: {
            "0": /\d/
          },
          unmask: true
        }
      }} />} />

                <Box sx={{
        display: "flex",
        justifyContent: "flex-end",
        mt: 2
      }}>
                    <Button onClick={() => navigate('/clientes')} sx={{
          mr: 1
        }}>Cancelar</Button>

                    {opr !== 'view' && <Button type="submit" variant="contained" color="primary">{id ? "Atualizar" : "Cadastrar"}</Button>}
                </Box>

            </Box>

            
            {showCpfModal && <Box sx={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
                    <Box sx={{
        backgroundColor: "white",
        p: 4,
        borderRadius: 2,
        minWidth: 300
      }}>

                        <Typography variant="h6" gutterBottom>CPF já cadastrado</Typography>
                        <Typography variant="body1" sx={{
          mb: 2
        }}>Este CPF já está vinculado a outro cliente.</Typography>
                        <Box sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1
        }}>
                            <Button onClick={() => setShowCpfModal(false)}>Cancelar</Button>
                            <Button color="info" variant="outlined" onClick={handleViewDuplicate}>Visualizar</Button>
                            <Button color="primary" variant="contained" onClick={handleEditDuplicate}>Editar</Button>
                        </Box>
                    </Box>
                </Box>}

        </Box>;
};
export default ClienteForm;
