import { AddShoppingCart, PointOfSale, ReceiptLong, Refresh, Search } from '@mui/icons-material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ListToolbar from '../components/common/ListToolbar';
import PageLayout from '../components/common/PageLayout';
import Button from '../components/ui/Button';
import { getCaixaDashboard, getComandasDetalhe } from '../services/recebimentoService';

const formatCurrency = value => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
}).format(Number(value || 0));

const ComandaList = () => {
  const navigate = useNavigate();
  const [comandas, setComandas] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [detalhes, setDetalhes] = useState([]);
  const [numeroComanda, setNumeroComanda] = useState('');

  const fetchComandas = useCallback(async () => {
    try {
      const data = await getCaixaDashboard();
      setComandas(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(`Erro ao buscar comandas: ${error.apiMessage || error.message}`, {
        position: 'top-center',
      });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComandas();
  }, [fetchComandas]);

  useEffect(() => {
    const fetchDetalhes = async () => {
      if (selectedIds.length === 0) {
        setDetalhes([]);
        return;
      }

      try {
        const data = await getComandasDetalhe(selectedIds);
        setDetalhes(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(`Erro ao carregar itens da comanda: ${error.apiMessage || error.message}`, {
          position: 'top-center',
        });
      }
    };

    fetchDetalhes();
  }, [selectedIds]);

  const totalSelecionado = useMemo(
    () => detalhes.reduce((total, comanda) => total + Number(comanda.total || 0), 0),
    [detalhes],
  );

  const toggleComanda = id => {
    setSelectedIds(current => (
      current.includes(id)
        ? current.filter(selectedId => selectedId !== id)
        : [...current, id]
    ));
  };

  const handleSelecionarPorNumero = () => {
    const value = numeroComanda.trim();
    const comanda = comandas.find(item => String(item.comanda) === value || String(item.id) === value);

    if (!comanda) {
      toast.warn('Comanda aberta não encontrada.', { position: 'top-center' });
      return;
    }

    if (!selectedIds.includes(comanda.id)) {
      setSelectedIds(current => [...current, comanda.id]);
    }
    setNumeroComanda('');
  };

  const handleReceber = () => {
    if (selectedIds.length === 0) {
      toast.warn('Selecione pelo menos uma comanda.', { position: 'top-center' });
      return;
    }

    navigate('/caixa', { state: { selectedIds } });
  };

  return (
    <PageLayout
      title="Comandas"
      description="Dashboard de comandas abertas para conferência do cliente"
      maxWidth="xl"
    >
      <ListToolbar
        icon={<ReceiptLong />}
        title="Comandas abertas"
        description={`${comandas.length} comanda(s) em aberto`}
        actions={
          <>
            <Button variant="outline" onClick={fetchComandas}>
              <Refresh />
              Atualizar
            </Button>
            <Button variant="secondary" onClick={handleReceber} disabled={selectedIds.length === 0}>
              <PointOfSale />
              Receber no caixa
            </Button>
          </>
        }
      />

      <div className="cashier-layout">
        <section className="cashier-panel">
          <div className="cashier-search">
            <input
              className="input"
              value={numeroComanda}
              onChange={event => setNumeroComanda(event.target.value)}
              placeholder="Número ou ID da comanda"
            />
            <Button variant="secondary" onClick={handleSelecionarPorNumero}>
              <Search />
              Selecionar
            </Button>
          </div>

          <div className="command-grid">
            {comandas.map(comanda => {
              const selected = selectedIds.includes(comanda.id);
              return (
                <button
                  className={`command-tile ${selected ? 'is-selected' : ''}`}
                  key={comanda.id}
                  onClick={() => toggleComanda(comanda.id)}
                  type="button"
                >
                  <span className="command-tile__top">
                    <strong>{`Comanda ${comanda.comanda}`}</strong>
                    <span className="badge" data-variant={selected ? 'success' : 'muted'}>
                      {selected ? 'Selecionada' : 'Aberta'}
                    </span>
                  </span>
                  <span>{comanda.cliente?.nome || 'Cliente não informado'}</span>
                  <span>{`${comanda.itens_count} item(ns)`}</span>
                  <span className="badge" data-variant="success">{formatCurrency(comanda.total)}</span>
                </button>
              );
            })}
            {comandas.length === 0 && <div className="empty-state">Nenhuma comanda aberta.</div>}
          </div>
        </section>

        <aside className="cashier-summary">
          <h2>Conferência</h2>
          <div className="selected-orders">
            {detalhes.map(comanda => (
              <article className="selected-order" key={comanda.id}>
                <header>
                  <strong>{`Comanda ${comanda.comanda}`}</strong>
                  <span>{formatCurrency(comanda.total)}</span>
                </header>
                <p>{comanda.cliente?.nome || 'Cliente não informado'}</p>
                <div className="order-items">
                  {comanda.itens.map(item => (
                    <div className="order-item" key={item.id}>
                      {item.produto?.foto ? (
                        <img src={item.produto.foto} alt={item.produto.nome} />
                      ) : (
                        <span className="order-item__placeholder"><AddShoppingCart /></span>
                      )}
                      <div>
                        <strong>{item.produto?.nome || `Produto ${item.produto_id}`}</strong>
                        <span>{`${item.quantidade} x ${formatCurrency(item.valor_unitario)}`}</span>
                      </div>
                      <b>{formatCurrency(item.valor_total)}</b>
                    </div>
                  ))}
                </div>
              </article>
            ))}
            {detalhes.length === 0 && <p className="muted-text">Selecione uma ou mais comandas para exibir os produtos consumidos.</p>}
          </div>

          <div className="cashier-totals">
            <div><span>Comandas selecionadas</span><strong>{selectedIds.length}</strong></div>
            <div><span>Total</span><strong>{formatCurrency(totalSelecionado)}</strong></div>
          </div>

          <Button variant="success" onClick={handleReceber} disabled={selectedIds.length === 0}>
            <PointOfSale />
            Receber no caixa
          </Button>
        </aside>
      </div>
    </PageLayout>
  );
};

export default ComandaList;
