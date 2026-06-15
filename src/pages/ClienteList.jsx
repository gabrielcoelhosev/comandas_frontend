import { FiberNew, PeopleAlt, PictureAsPdf } from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ActionButtons from '../components/common/ActionButtons';
import ListToolbar from '../components/common/ListToolbar';
import PageLayout from '../components/common/PageLayout';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import { deleteCliente, getClientes } from '../services/clienteService';

function ClienteList() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);

  const fetchClientes = useCallback(async () => {
    try {
      const data = await getClientes();
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error('Erro ao buscar clientes.', { position: 'top-center' });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClientes();
  }, [fetchClientes]);

  const handleDeleteConfirm = async (id) => {
    try {
      await deleteCliente(id);
      await fetchClientes();
      toast.dismiss();
      toast.success('Cliente excluído com sucesso!', { position: 'top-center' });
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      toast.error('Erro ao excluir cliente.', { position: 'top-center' });
    }
  };

  const handleDeleteClick = (cliente) => {
    toast(
      <div>
        <p>
          Tem certeza que deseja excluir o cliente <strong>{cliente.nome}</strong>?
        </p>
        <div className="dialog-actions" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
          <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirm(cliente.id_cliente)}>
            Excluir
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.dismiss()}>
            Cancelar
          </Button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      },
    );
  };

  const handleGeneratePdf = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Clientes', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['ID', 'Nome', 'CPF', 'Telefone']],
      body: clientes.map((cliente) => [cliente.id_cliente, cliente.nome, cliente.cpf, cliente.telefone]),
    });
    doc.save('relatorio_clientes.pdf');
  };

  const columns = [
    { key: 'id_cliente', header: 'ID' },
    { key: 'nome', header: 'Nome', render: (cliente) => <strong>{cliente.nome}</strong> },
    { key: 'cpf', header: 'CPF' },
    { key: 'telefone', header: 'Telefone' },
    {
      key: 'actions',
      header: 'Ações',
      render: (cliente) => (
        <ActionButtons
          item={cliente}
          onView={() => navigate(`/cliente/view/${cliente.id_cliente}`)}
          onEdit={() => navigate(`/cliente/edit/${cliente.id_cliente}`)}
          onDelete={handleDeleteClick}
        />
      ),
    },
  ];

  const renderMobileCard = (cliente) => (
    <>
      <div className="entity-card__header">
        <div>
          <p className="entity-card__title">{cliente.nome}</p>
          <p className="entity-card__meta">{`ID ${cliente.id_cliente} - CPF ${cliente.cpf}`}</p>
        </div>
        <span className="badge" data-variant="muted">Cliente</span>
      </div>
      <div className="entity-card__grid">
        <span>{cliente.telefone || 'Telefone não informado'}</span>
      </div>
      <ActionButtons
        item={cliente}
        onView={() => navigate(`/cliente/view/${cliente.id_cliente}`)}
        onEdit={() => navigate(`/cliente/edit/${cliente.id_cliente}`)}
        onDelete={handleDeleteClick}
      />
    </>
  );

  return (
    <PageLayout title="Clientes" description="Cadastro e relatório dos clientes">
      <ListToolbar
        icon={<PeopleAlt />}
        title="Clientes"
        description={`${clientes.length} registro(s) encontrados`}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/cliente')}>
              <FiberNew />
              Novo
            </Button>
            <Button variant="outline" onClick={handleGeneratePdf}>
              <PictureAsPdf />
              Gerar PDF
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={clientes}
        getRowKey={(cliente) => cliente.id_cliente}
        renderMobileCard={renderMobileCard}
      />
    </PageLayout>
  );
}

export default ClienteList;
