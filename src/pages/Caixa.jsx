import {
  AddShoppingCart,
  CheckCircle,
  PointOfSale,
  ReceiptLong,
  Refresh,
  Search,
} from '@mui/icons-material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import ListToolbar from '../components/common/ListToolbar';
import PageLayout from '../components/common/PageLayout';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getClientes } from '../services/clienteService';
import {
  getCaixaDashboard,
  getComandasDetalhe,
  getComprovante,
  receberComandas,
} from '../services/recebimentoService';

const formatCurrency = value => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
}).format(Number(value || 0));

const getClienteId = cliente => cliente?.id ?? cliente?.id_cliente;

const Caixa = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [comandas, setComandas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [selectedIds, setSelectedIds] = useState(location.state?.selectedIds || []);
  const [detalhes, setDetalhes] = useState([]);
  const [numeroComanda, setNumeroComanda] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [desconto, setDesconto] = useState('');
  const [acrescimo, setAcrescimo] = useState('');
  const [comprovante, setComprovante] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashboardData, clientesData] = await Promise.all([
        getCaixaDashboard(),
        getClientes(),
      ]);
      setComandas(Array.isArray(dashboardData) ? dashboardData : []);
      setClientes(Array.isArray(clientesData) ? clientesData : []);
    } catch (error) {
      toast.error(`Erro ao carregar caixa: ${error.apiMessage || error.message}`, {
        position: 'top-center',
      });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
  }, [fetchDashboard]);

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
        toast.error(`Erro ao detalhar comandas: ${error.apiMessage || error.message}`, {
          position: 'top-center',
        });
      }
    };

    fetchDetalhes();
  }, [selectedIds]);

  const totalBruto = useMemo(
    () => detalhes.reduce((total, comanda) => total + Number(comanda.total || 0), 0),
    [detalhes],
  );

  const totalFinal = Math.max(
    0,
    totalBruto - Number(desconto || 0) + Number(acrescimo || 0),
  );

  const toggleComanda = id => {
    setComprovante(null);
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

  const handleReceber = async () => {
    if (selectedIds.length === 0) {
      toast.warn('Selecione pelo menos uma comanda.', { position: 'top-center' });
      return;
    }

    setLoading(true);
    try {
      const recebimento = await receberComandas({
        comanda_ids: selectedIds,
        funcionario_id: user?.id,
        cliente_id: clienteId ? Number(clienteId) : undefined,
        desconto,
        acrescimo,
      });
      const comprovanteData = await getComprovante(recebimento.id);
      setComprovante(comprovanteData);
      setSelectedIds([]);
      setDetalhes([]);
      setDesconto('');
      setAcrescimo('');
      setClienteId('');
      await fetchDashboard();
      toast.success('Pagamento registrado com sucesso!', { position: 'top-center' });
    } catch (error) {
      toast.error(`Erro ao receber comandas: ${error.apiMessage || error.message}`, {
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Caixa" description="Recebimento e fechamento de comandas abertas" maxWidth="xl">
      <ListToolbar
        icon={<PointOfSale />}
        title="Comandas abertas"
        description={`${comandas.length} comanda(s) disponível(is)`}
        actions={
          <Button variant="outline" onClick={fetchDashboard}>
            <Refresh />
            Atualizar
          </Button>
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
                    {selected && <CheckCircle />}
                  </span>
                  <span>{comanda.cliente?.nome || 'Cliente não informado'}</span>
                  <span className="badge" data-variant="success">{formatCurrency(comanda.total)}</span>
                </button>
              );
            })}
            {comandas.length === 0 && <div className="empty-state">Nenhuma comanda aberta.</div>}
          </div>
        </section>

        <aside className="cashier-summary">
          <h2>Conferência</h2>
          <div className="field-group">
            <label className="field-label" htmlFor="cliente_id">Cliente</label>
            <select id="cliente_id" className="select" value={clienteId} onChange={event => setClienteId(event.target.value)}>
              <option value="">Não informado</option>
              {clientes.map(cliente => (
                <option key={getClienteId(cliente)} value={getClienteId(cliente)}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>

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
            {detalhes.length === 0 && <p className="muted-text">Selecione uma comanda para conferir os itens.</p>}
          </div>

          <div className="cashier-totals">
            <label>
              <span>Desconto</span>
              <input className="input" min="0" step="0.01" type="number" value={desconto} onChange={event => setDesconto(event.target.value)} />
            </label>
            <label>
              <span>Acréscimo</span>
              <input className="input" min="0" step="0.01" type="number" value={acrescimo} onChange={event => setAcrescimo(event.target.value)} />
            </label>
            <div><span>Subtotal</span><strong>{formatCurrency(totalBruto)}</strong></div>
            <div><span>Total final</span><strong>{formatCurrency(totalFinal)}</strong></div>
          </div>

          <Button variant="success" onClick={handleReceber} disabled={loading || selectedIds.length === 0}>
            <ReceiptLong />
            Finalizar pagamento
          </Button>
        </aside>
      </div>

      {comprovante && (
        <section className="receipt-panel">
          <header>
            <div>
              <span className="badge">Comprovante</span>
              <h2>{`Recebimento #${comprovante.id}`}</h2>
            </div>
            <strong>{formatCurrency(comprovante.valor_total)}</strong>
          </header>
          <p>{`Funcionário: ${comprovante.funcionario?.nome || comprovante.funcionario_id}`}</p>
          <p>{`Data: ${new Date(comprovante.data_hora).toLocaleString('pt-BR')}`}</p>
          {comprovante.comandas.map(comanda => (
            <div className="receipt-order" key={comanda.id}>
              <strong>{`Comanda ${comanda.comanda}`}</strong>
              <span>{formatCurrency(comanda.total)}</span>
            </div>
          ))}
        </section>
      )}
    </PageLayout>
  );
};

export default Caixa;
