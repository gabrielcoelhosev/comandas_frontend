import { Add, AddShoppingCart, Delete, Edit, History, PointOfSale, ReceiptLong, Refresh, Search, Visibility } from '@mui/icons-material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ListToolbar from '../components/common/ListToolbar';
import PageLayout from '../components/common/PageLayout';
import Button from '../components/ui/Button';
import Dialog from '../components/ui/Dialog';
import { useAuth } from '../context/AuthContext';
import { createComanda, deleteComanda, getComandasFechadas, updateComanda } from '../services/comandaService';
import { getClientes } from '../services/clienteService';
import { getProdutos } from '../services/produtoService';
import { getCaixaDashboard, getComandasDetalhe } from '../services/recebimentoService';

const formatCurrency = value => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
}).format(Number(value || 0));

const ComandaList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [comandas, setComandas] = useState([]);
  const [comandasFechadas, setComandasFechadas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [detalhes, setDetalhes] = useState([]);
  const [numeroComanda, setNumeroComanda] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [closedDetail, setClosedDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingComandaId, setEditingComandaId] = useState(null);
  const [originalItemIds, setOriginalItemIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [novaComanda, setNovaComanda] = useState({
    comanda: '',
    cliente_id: '',
    itens: [{ produto_id: '', quantidade: 1 }],
  });

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

  const fetchComandasFechadas = useCallback(async () => {
    try {
      const data = await getComandasFechadas();
      setComandasFechadas(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(`Erro ao buscar comandas fechadas: ${error.apiMessage || error.message}`, {
        position: 'top-center',
      });
    }
  }, []);

  const refreshComandas = useCallback(async () => {
    await Promise.all([
      fetchComandas(),
      fetchComandasFechadas(),
    ]);
  }, [fetchComandas, fetchComandasFechadas]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshComandas();
  }, [refreshComandas]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [clientesData, produtosData] = await Promise.all([
          getClientes(),
          getProdutos(),
        ]);

        setClientes(Array.isArray(clientesData) ? clientesData : []);
        setProdutos(Array.isArray(produtosData) ? produtosData : []);
      } catch (error) {
        toast.error(`Erro ao carregar dados para nova comanda: ${error.apiMessage || error.message}`, {
          position: 'top-center',
        });
      }
    };

    fetchOptions();
  }, []);

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

  const totalNovaComanda = useMemo(
    () => novaComanda.itens.reduce((total, item) => {
      const produto = produtos.find(produtoItem => String(produtoItem.id) === String(item.produto_id));
      return total + (Number(produto?.valor_unitario || 0) * Number(item.quantidade || 0));
    }, 0),
    [novaComanda.itens, produtos],
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

  const handleViewClosedComanda = async id => {
    try {
      const data = await getComandasDetalhe([id]);
      const comanda = Array.isArray(data) ? data[0] : null;

      if (!comanda) {
        toast.warn('Comanda fechada nao encontrada.', { position: 'top-center' });
        return;
      }

      setClosedDetail(comanda);
    } catch (error) {
      toast.error(`Erro ao carregar comanda fechada: ${error.apiMessage || error.message}`, {
        position: 'top-center',
      });
    }
  };

  const updateNovaComanda = (field, value) => {
    setNovaComanda(current => ({ ...current, [field]: value }));
  };

  const updateItem = (index, field, value) => {
    setNovaComanda(current => ({
      ...current,
      itens: current.itens.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }));
  };

  const addItem = () => {
    setNovaComanda(current => ({
      ...current,
      itens: [...current.itens, { produto_id: '', quantidade: 1 }],
    }));
  };

  const removeItem = index => {
    setNovaComanda(current => ({
      ...current,
      itens: current.itens.length === 1 && !editingComandaId
        ? [{ produto_id: '', quantidade: 1 }]
        : current.itens.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const resetNovaComanda = () => {
    setEditingComandaId(null);
    setOriginalItemIds([]);
    setNovaComanda({
      comanda: '',
      cliente_id: '',
      itens: [{ produto_id: '', quantidade: 1 }],
    });
  };

  const openCreateComanda = () => {
    resetNovaComanda();
    setShowCreateDialog(true);
  };

  const handleEditComanda = async id => {
    try {
      const data = await getComandasDetalhe([id]);
      const comanda = Array.isArray(data) ? data[0] : null;

      if (!comanda) {
        toast.warn('Comanda nao encontrada para edicao.', { position: 'top-center' });
        return;
      }

      const itens = comanda.itens?.length
        ? comanda.itens.map(item => ({
          id: item.id,
          produto_id: item.produto_id || item.produto?.id || '',
          quantidade: item.quantidade || 1,
          valor_unitario: item.valor_unitario || item.produto?.valor_unitario,
        }))
        : [{ produto_id: '', quantidade: 1 }];

      setEditingComandaId(comanda.id);
      setOriginalItemIds(itens.filter(item => item.id).map(item => item.id));
      setNovaComanda({
        comanda: String(comanda.comanda || ''),
        cliente_id: comanda.cliente_id || comanda.cliente?.id || '',
        itens,
      });
      setShowCreateDialog(true);
    } catch (error) {
      toast.error(`Erro ao carregar comanda para edicao: ${error.apiMessage || error.message}`, {
        position: 'top-center',
      });
    }
  };

  const handleDeleteComanda = comanda => {
    setDeleteTarget(comanda);
  };

  const confirmDeleteComanda = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await deleteComanda(deleteTarget.id);
      setSelectedIds(current => current.filter(id => id !== deleteTarget.id));
      toast.success(`Comanda ${deleteTarget.comanda} excluida com sucesso.`, { position: 'top-center' });
      setDeleteTarget(null);
      await refreshComandas();
    } catch (error) {
      toast.error(`Erro ao excluir comanda: ${error.apiMessage || error.message}`, {
        position: 'top-center',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveComanda = async () => {
    const itensValidos = novaComanda.itens
      .filter(item => item.produto_id && Number(item.quantidade) > 0)
      .map(item => {
        const produto = produtos.find(produtoItem => String(produtoItem.id) === String(item.produto_id));

        return {
          ...item,
          valor_unitario: produto?.valor_unitario,
        };
      });

    if (!novaComanda.comanda.trim()) {
      toast.warn('Informe o numero da comanda.', { position: 'top-center' });
      return;
    }

    if (!editingComandaId && itensValidos.length === 0) {
      toast.warn('Inclua pelo menos um produto consumido.', { position: 'top-center' });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...novaComanda,
        funcionario_id: user?.id_funcionario || user?.id,
        itens: itensValidos,
        original_item_ids: originalItemIds,
      };
      const comanda = editingComandaId
        ? await updateComanda(editingComandaId, payload)
        : await createComanda(payload);

      toast.success(`Comanda ${comanda?.comanda || novaComanda.comanda} salva com sucesso.`, {
        position: 'top-center',
      });
      const savedEditingId = editingComandaId;
      setShowCreateDialog(false);
      resetNovaComanda();
      await refreshComandas();
      if (savedEditingId) {
        setSelectedIds(current => (current.includes(savedEditingId) ? [...current] : current));
      }
    } catch (error) {
      toast.error(`Erro ao salvar comanda: ${error.apiMessage || error.message}`, {
        position: 'top-center',
      });
    } finally {
      setSaving(false);
    }
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
            <Button variant="outline" onClick={refreshComandas}>
              <Refresh />
              Atualizar
            </Button>
            <Button variant="default" onClick={openCreateComanda}>
              <Add />
              Nova comanda
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
                <article
                  className={`command-tile ${selected ? 'is-selected' : ''}`}
                  key={comanda.id}
                >
                  <button
                    className="command-tile__select"
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
                  <div className="command-tile__actions">
                    <Button size="icon" variant="outline" title="Editar comanda" onClick={() => handleEditComanda(comanda.id)}>
                      <Edit />
                    </Button>
                    <Button size="icon" variant="destructive" title="Excluir comanda" onClick={() => handleDeleteComanda(comanda)}>
                      <Delete />
                    </Button>
                  </div>
                </article>
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

      <section className="closed-commands-section">
        <ListToolbar
          icon={<History />}
          title="Comandas fechadas"
          description={`${comandasFechadas.length} comanda(s) fechada(s)`}
        />

        <div className="command-grid">
          {comandasFechadas.map(comanda => (
            <article className="command-tile command-tile--closed" key={comanda.id}>
              <div className="command-tile__select">
                <span className="command-tile__top">
                  <strong>{`Comanda ${comanda.comanda}`}</strong>
                  <span className="badge" data-variant="muted">Fechada</span>
                </span>
                <span>{comanda.cliente?.nome || 'Cliente nao informado'}</span>
                <span>{`${comanda.itens_count || 0} item(ns)`}</span>
                <span>{comanda.data_hora ? new Date(comanda.data_hora).toLocaleString('pt-BR') : 'Data nao informada'}</span>
                <span className="badge" data-variant="success">{formatCurrency(comanda.total)}</span>
              </div>
              <div className="command-tile__actions">
                <Button size="sm" variant="outline" onClick={() => handleViewClosedComanda(comanda.id)}>
                  <Visibility />
                  Ver itens
                </Button>
              </div>
            </article>
          ))}
          {comandasFechadas.length === 0 && <div className="empty-state">Nenhuma comanda fechada.</div>}
        </div>
      </section>

      <Dialog
        open={showCreateDialog}
        title={editingComandaId ? 'Editar comanda' : 'Nova comanda'}
        onClose={() => !saving && setShowCreateDialog(false)}
        actions={
          <>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="default" onClick={handleSaveComanda} disabled={saving}>
              {editingComandaId ? <Edit /> : <Add />}
              {editingComandaId ? 'Salvar comanda' : 'Criar comanda'}
            </Button>
          </>
        }
      >
        <div className="create-command-form">
          <label className="field-group">
            <span className="field-label">Numero da comanda</span>
            <input
              className="input"
              value={novaComanda.comanda}
              onChange={event => updateNovaComanda('comanda', event.target.value)}
              placeholder="Ex.: 42"
            />
            <span className="field-error" />
          </label>

          <label className="field-group">
            <span className="field-label">Cliente</span>
            <select
              className="select"
              value={novaComanda.cliente_id}
              onChange={event => updateNovaComanda('cliente_id', event.target.value)}
            >
              <option value="">Cliente nao informado</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
              ))}
            </select>
            <span className="field-error" />
          </label>

          <div className="command-items-editor">
            <div className="command-items-editor__header">
              <strong>Produtos consumidos</strong>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Add />
                Item
              </Button>
            </div>

            {novaComanda.itens.map((item, index) => (
              <div className="command-item-row" key={`${index}-${item.produto_id}`}>
                <label className="field-group">
                  <span className="field-label">Produto</span>
                  <select
                    className="select"
                    value={item.produto_id}
                    onChange={event => updateItem(index, 'produto_id', event.target.value)}
                  >
                    <option value="">Selecione</option>
                    {produtos.map(produto => (
                      <option key={produto.id} value={produto.id}>
                        {`${produto.nome} - ${formatCurrency(produto.valor_unitario)}`}
                      </option>
                    ))}
                  </select>
                  <span className="field-error" />
                </label>

                <label className="field-group">
                  <span className="field-label">Qtd.</span>
                  <input
                    className="input"
                    min="1"
                    type="number"
                    value={item.quantidade}
                    onChange={event => updateItem(index, 'quantidade', event.target.value)}
                  />
                  <span className="field-error" />
                </label>

                <Button
                  aria-label="Remover item"
                  className="command-item-row__remove"
                  disabled={!editingComandaId && novaComanda.itens.length === 1}
                  onClick={() => removeItem(index)}
                  size="icon"
                  title="Remover item"
                  variant="outline"
                >
                  <Delete />
                </Button>
              </div>
            ))}
            {novaComanda.itens.length === 0 && (
              <div className="empty-state command-items-editor__empty">
                Nenhum produto na comanda.
              </div>
            )}
          </div>

          <div className="cashier-totals">
            <div><span>Total previsto</span><strong>{formatCurrency(totalNovaComanda)}</strong></div>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        title="Excluir comanda"
        onClose={() => !deleting && setDeleteTarget(null)}
        actions={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteComanda} disabled={deleting}>
              <Delete />
              Excluir comanda
            </Button>
          </>
        }
      >
        <div className="confirm-dialog">
          <span className="confirm-dialog__icon">
            <Delete />
          </span>
          <div className="confirm-dialog__body">
            <p className="confirm-dialog__title">
              {`Tem certeza que deseja excluir a comanda ${deleteTarget?.comanda}?`}
            </p>
            <p>
              Esta acao remove os produtos vinculados e exclui a comanda aberta. Use apenas quando o lancamento foi criado por engano.
            </p>
            <div className="confirm-dialog__summary">
              <span>{deleteTarget?.cliente?.nome || 'Cliente nao informado'}</span>
              <strong>{formatCurrency(deleteTarget?.total)}</strong>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(closedDetail)}
        title={closedDetail ? `Comanda fechada ${closedDetail.comanda}` : 'Comanda fechada'}
        onClose={() => setClosedDetail(null)}
        actions={
          <Button variant="outline" onClick={() => setClosedDetail(null)}>
            Fechar
          </Button>
        }
      >
        {closedDetail && (
          <div className="selected-order selected-order--dialog">
            <header>
              <strong>{closedDetail.cliente?.nome || 'Cliente nao informado'}</strong>
              <span>{formatCurrency(closedDetail.total)}</span>
            </header>
            <div className="order-items">
              {(closedDetail.itens || []).map(item => (
                <div className="order-item" key={item.id || `${item.produto_id}-${item.quantidade}`}>
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
          </div>
        )}
      </Dialog>
    </PageLayout>
  );
};

export default ComandaList;
