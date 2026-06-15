import { ArrowBack, ReceiptLong, Save } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageLayout from '../components/common/PageLayout';
import Button from '../components/ui/Button';
import { getClientes } from '../services/clienteService';
import {
  getComprovante,
  getRecebimentoById,
  updateRecebimento,
} from '../services/recebimentoService';

const formatCurrency = value => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
}).format(Number(value || 0));

const getClienteId = cliente => cliente?.id ?? cliente?.id_cliente;

const RecebimentoForm = () => {
  const { id, opr } = useParams();
  const navigate = useNavigate();
  const isReadOnly = opr === 'view';
  const [recebimento, setRecebimento] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ cliente_id: '', desconto: '', acrescimo: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recebimentoData, clientesData] = await Promise.all([
          isReadOnly ? getComprovante(id) : getRecebimentoById(id),
          getClientes(),
        ]);
        setRecebimento(recebimentoData);
        setClientes(Array.isArray(clientesData) ? clientesData : []);
        setForm({
          cliente_id: recebimentoData.cliente_id || '',
          desconto: recebimentoData.desconto || 0,
          acrescimo: recebimentoData.acrescimo || 0,
        });
      } catch (error) {
        toast.error(`Erro ao carregar recebimento: ${error.apiMessage || error.message}`, {
          position: 'top-center',
        });
      }
    };

    fetchData();
  }, [id, isReadOnly]);

  const totalFinal = useMemo(() => {
    if (!recebimento) return 0;
    return Math.max(0, Number(recebimento.valor_bruto || 0) - Number(form.desconto || 0) + Number(form.acrescimo || 0));
  }, [form.acrescimo, form.desconto, recebimento]);

  const onSubmit = async event => {
    event.preventDefault();
    try {
      await updateRecebimento(id, {
        cliente_id: form.cliente_id ? Number(form.cliente_id) : undefined,
        desconto: form.desconto,
        acrescimo: form.acrescimo,
      });
      toast.success('Recebimento atualizado com sucesso!', { position: 'top-center' });
      navigate('/recebimentos');
    } catch (error) {
      toast.error(`Erro ao atualizar recebimento: ${error.apiMessage || error.message}`, {
        position: 'top-center',
      });
    }
  };

  return (
    <PageLayout
      title={isReadOnly ? `Comprovante #${id}` : `Editar Recebimento #${id}`}
      description={isReadOnly ? 'Detalhamento das comandas quitadas' : 'Ajuste cliente, desconto e acréscimo'}
      maxWidth="md"
      actions={
        <Button variant="outline" onClick={() => navigate('/recebimentos')}>
          <ArrowBack />
          Voltar
        </Button>
      }
    >
      {!recebimento ? (
        <div className="empty-state">Carregando recebimento...</div>
      ) : (
        <form className="receipt-form" onSubmit={onSubmit}>
          <section className="receipt-panel is-inline">
            <header>
              <div>
                <span className="badge">Recebimento</span>
                <h2>{`#${recebimento.id}`}</h2>
              </div>
              <strong>{formatCurrency(isReadOnly ? recebimento.valor_total : totalFinal)}</strong>
            </header>
            <p>{`Funcionário: ${recebimento.funcionario?.nome || recebimento.funcionario_id}`}</p>
            <p>{`Data: ${new Date(recebimento.data_hora).toLocaleString('pt-BR')}`}</p>
            <p>{`Comandas: ${recebimento.comanda_ids.join(', ')}`}</p>
          </section>

          <div className="form-grid">
            <div className="span-2 field-group">
              <label className="field-label" htmlFor="cliente_id">Cliente</label>
              <select
                id="cliente_id"
                className="select"
                disabled={isReadOnly}
                value={form.cliente_id}
                onChange={event => setForm(current => ({ ...current, cliente_id: event.target.value }))}
              >
                <option value="">Não informado</option>
                {clientes.map(cliente => (
                  <option key={getClienteId(cliente)} value={getClienteId(cliente)}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>

            <label className="field-group">
              <span className="field-label">Desconto</span>
              <input
                className="input"
                disabled={isReadOnly}
                min="0"
                step="0.01"
                type="number"
                value={form.desconto}
                onChange={event => setForm(current => ({ ...current, desconto: event.target.value }))}
              />
            </label>

            <label className="field-group">
              <span className="field-label">Acréscimo</span>
              <input
                className="input"
                disabled={isReadOnly}
                min="0"
                step="0.01"
                type="number"
                value={form.acrescimo}
                onChange={event => setForm(current => ({ ...current, acrescimo: event.target.value }))}
              />
            </label>
          </div>

          {isReadOnly && recebimento.comandas?.map(comanda => (
            <section className="receipt-order-detail" key={comanda.id}>
              <header>
                <strong>{`Comanda ${comanda.comanda}`}</strong>
                <span>{formatCurrency(comanda.total)}</span>
              </header>
              {comanda.itens.map(item => (
                <div className="order-item" key={item.id}>
                  {item.produto?.foto ? <img src={item.produto.foto} alt={item.produto.nome} /> : <span className="order-item__placeholder"><ReceiptLong /></span>}
                  <div>
                    <strong>{item.produto?.nome || `Produto ${item.produto_id}`}</strong>
                    <span>{`${item.quantidade} x ${formatCurrency(item.valor_unitario)}`}</span>
                  </div>
                  <b>{formatCurrency(item.valor_total)}</b>
                </div>
              ))}
            </section>
          ))}

          {!isReadOnly && (
            <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
              <Button variant="default" type="submit">
                <Save />
                Salvar
              </Button>
            </div>
          )}
        </form>
      )}
    </PageLayout>
  );
};

export default RecebimentoForm;
