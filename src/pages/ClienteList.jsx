import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Toolbar, Typography, IconButton, Button, useMediaQuery } from '@mui/material';
import { Edit, Delete, Visibility, FiberNew, PictureAsPdf } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getClientes, deleteCliente } from '../services/clienteService';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
function ClienteList() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [clientes, setClientes] = useState([]);
  useEffect(() => {
    fetchClientes();
  }, []);
  const fetchClientes = async () => {
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };
  const handleDeleteClick = cliente => {
    toast(<div>
                <Typography>Tem certeza que deseja excluir o cliente <strong>{cliente.nome}</strong>?</Typography>
                <div style={{
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
                    <Button variant="contained" color="error" size="small" onClick={() => handleDeleteConfirm(cliente.id_cliente)} style={{
          marginRight: '10px'
        }}>Excluir</Button>
                    <Button variant="outlined" size="small" onClick={() => toast.dismiss()}>Cancelar</Button>
                </div>
            </div>, {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false
    });
  };
  const handleDeleteConfirm = async id => {
    try {
      await deleteCliente(id);
      fetchClientes();
      toast.dismiss();
      toast.success('Cliente excluído com sucesso!', {
        position: "top-center"
      });
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      toast.error('Erro ao excluir cliente.', {
        position: "top-center"
      });
    }
  };
  const handleGeneratePdf = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Clientes', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['ID', 'Nome', 'CPF', 'Telefone']],
      body: clientes.map(c => [c.id_cliente, c.nome, c.cpf, c.telefone])
    });
    doc.save('relatorio_clientes.pdf');
  };
  return <TableContainer component={Paper}>

            <Toolbar sx={{
      backgroundColor: '#ADD8E6',
      padding: 2,
      borderRadius: 1,
      mb: 2,
      display: 'flex',
      justifyContent: 'space-between'
    }}>
                <Typography variant="h6" color="success" sx={{
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
                    <PictureAsPdf fontSize="medium" /> Clientes
                </Typography>
                <Button variant="contained" color="success" onClick={() => navigate('/cliente')} startIcon={<FiberNew />}>Novo</Button>
                <Button variant="contained" color="success" startIcon={<PictureAsPdf />} onClick={handleGeneratePdf}>Gerar PDF</Button>
            </Toolbar>
            
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Nome</TableCell>
                        <TableCell>CPF</TableCell>
                         
                        {!isSmallScreen && <>
                                <TableCell>Telefone</TableCell>
                            </>}
                        <TableCell>Ações</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {clientes.map(cliente => <TableRow key={cliente.id_cliente}>
                            <TableCell>{cliente.id_cliente}</TableCell>
                            <TableCell>{cliente.nome}</TableCell>
                            <TableCell>{cliente.cpf}</TableCell>
                            
                            {!isSmallScreen && <>
                                    <TableCell>{cliente.telefone}</TableCell>
                                </>}
                            <TableCell>
                                
                                <IconButton onClick={() => navigate(`/cliente/view/${cliente.id_cliente}`)}>
                                    <Visibility color="primary" />
                                </IconButton>
                                
                                <IconButton onClick={() => navigate(`/cliente/edit/${cliente.id_cliente}`)}>
                                    <Edit color="secondary" />
                                </IconButton>
                                <IconButton onClick={() => handleDeleteClick(cliente)}>
                                    <Delete color="error" />
                                </IconButton>
                            </TableCell>
                        </TableRow>)}
                </TableBody>
            </Table>
        </TableContainer>;
}
export default ClienteList;
