import { Delete, Edit, FiberNew, ReceiptLong, Visibility } from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ListToolbar from '../components/common/ListToolbar';
import PageLayout from '../components/common/PageLayout';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import { deleteRecebimento, getRecebimentos } from '../services/recebimentoService';

const formatCurrency = value => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
}).format(Number(value || 0));

const RecebimentoList = () => {
  const navigate = useNavigate();
  const [recebimentos, setRecebimentos] = useState([]);

  const fetchRecebimentos = useCallback(async () => {
    try {
      const data = await getRecebimentos();
      setRecebimentos(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(`Erro ao buscar recebimentos: ${error.apiMessage || error.message}`, {
        position: 'top-center',
      });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRecebimentos();
  }, [fetchRecebimentos]);

  const handleDelete = async recebimento => {
    try {
      await deleteRecebimento(recebimento.id);
      await fetchRecebimentos();
      toast.success('Recebimento excluído com sucesso!', { position: 'top-center' });
    } catch (error) {
      toast.error(`Erro ao excluir recebimento: ${error.apiMessage || error.message}`, {
        position: 'top-center',
      });
    }
  };

  const actions = recebimento => (
    <div className="row-actions">
      <Button size="icon" variant="outline" title="Visualizar comprovante" onClick={() => navigate(`/recebimento/view/${recebimento.id}`)}>
        <Visibility />
      </Button>
      <Button size="icon" variant="outline" title="Editar" onClick={() => navigate(`/recebimento/edit/${recebimento.id}`)}>
        <Edit />
      </Button>
      <Button size="icon" variant="destructive" title="Excluir" onClick={() => handleDelete(recebimento)}>
        <Delete />
      </Button>
    </div>
  );

  const columns = [
    { key: 'id', header: 'ID' },
    {
      key: 'data_hora',
      header: 'Data',
      render: recebimento => new Date(recebimento.data_hora).toLocaleString('pt-BR'),
    },
    {
      key: 'funcionario',
      header: 'Funcionário',
      render: recebimento => recebimento.funcionario?.nome || recebimento.funcionario_id,
    },
    {
      key: 'comandas',
      header: 'Comandas',
      render: recebimento => recebimento.comanda_ids.join(', '),
    },
    {
      key: 'valor_total',
      header: 'Total',
      render: recebimento => <span className="badge" data-variant="success">{formatCurrency(recebimento.valor_total)}</span>,
    },
    { key: 'actions', header: 'Ações', render: actions },
  ];

  const renderMobileCard = recebimento => (
    <>
      <div className="entity-card__header">
        <div>
          <p className="entity-card__title">{`Recebimento #${recebimento.id}`}</p>
          <p className="entity-card__meta">{new Date(recebimento.data_hora).toLocaleString('pt-BR')}</p>
        </div>
        <span className="badge" data-variant="success">{formatCurrency(recebimento.valor_total)}</span>
      </div>
      <div className="entity-card__grid">
        <span>{`Funcionário: ${recebimento.funcionario?.nome || recebimento.funcionario_id}`}</span>
        <span>{`Comandas: ${recebimento.comanda_ids.join(', ')}`}</span>
      </div>
      {actions(recebimento)}
    </>
  );

  return (
    <PageLayout title="Recebimentos" description="Transações registradas no caixa">
      <ListToolbar
        icon={<ReceiptLong />}
        title="Recebimentos"
        description={`${recebimentos.length} registro(s) encontrado(s)`}
        actions={
          <Button variant="secondary" onClick={() => navigate('/caixa')}>
            <FiberNew />
            Novo
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={recebimentos}
        getRowKey={recebimento => recebimento.id}
        renderMobileCard={renderMobileCard}
      />
    </PageLayout>
  );
};

export default RecebimentoList;
