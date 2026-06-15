import { FiberNew, RestaurantMenu } from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ActionButtons from '../components/common/ActionButtons';
import ListToolbar from '../components/common/ListToolbar';
import PageLayout from '../components/common/PageLayout';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import { deleteProduto, getProdutos } from '../services/produtoService';

function ProdutoList() {
  const [produtos, setProdutos] = useState([]);
  const navigate = useNavigate();

  const fetchProdutos = useCallback(async () => {
    try {
      const data = await getProdutos();
      setProdutos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast.error('Erro ao buscar produtos.', { position: 'top-center' });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProdutos();
  }, [fetchProdutos]);

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));

  const handleView = (produto) => navigate(`/produto/view/${produto.id}`);
  const handleEdit = (produto) => navigate(`/produto/edit/${produto.id}`);
  const handleDelete = async (produto) => {
    try {
      await deleteProduto(produto.id);
      await fetchProdutos();
      toast.success('Produto excluído com sucesso!', { position: 'top-center' });
    } catch (error) {
      toast.error(`Erro ao excluir produto: ${error.apiMessage || error.message}`, {
        position: 'top-center',
      });
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'nome', header: 'Nome', render: (produto) => <strong>{produto.nome}</strong> },
    {
      key: 'descricao',
      header: 'Descrição',
      render: (produto) => <span title={produto.descricao}>{produto.descricao}</span>,
    },
    {
      key: 'valor_unitario',
      header: 'Valor Unitário',
      render: (produto) => <span className="badge" data-variant="success">{formatCurrency(produto.valor_unitario)}</span>,
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (produto) => (
        <ActionButtons item={produto} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
      ),
    },
  ];

  const renderMobileCard = (produto) => (
    <>
      <div className="entity-card__header">
        <div>
          <p className="entity-card__title">{produto.nome}</p>
          <p className="entity-card__meta">{`ID ${produto.id}`}</p>
        </div>
        <span className="badge" data-variant="success">{formatCurrency(produto.valor_unitario)}</span>
      </div>
      <div className="entity-card__grid">
        <span>{produto.descricao || 'Sem descrição'}</span>
      </div>
      <ActionButtons item={produto} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
    </>
  );

  return (
    <PageLayout title="Produtos" description="Cardápio, preços e itens disponíveis">
      <ListToolbar
        icon={<RestaurantMenu />}
        title="Produtos"
        description={`${produtos.length} registro(s) encontrados`}
        actions={
          <Button variant="secondary" onClick={() => navigate('/produto')}>
            <FiberNew />
            Novo
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={produtos}
        getRowKey={(produto) => produto.id}
        renderMobileCard={renderMobileCard}
      />
    </PageLayout>
  );
}

export default ProdutoList;
