const MOCK_STORAGE_KEY = 'local_admin_mock_data';

export const isLocalAdmin = () => sessionStorage.getItem('local_admin') === 'true';

const nowIso = () => new Date().toISOString();

const initialData = () => ({
  clientes: [
    { id: 1, id_cliente: 1, nome: 'Marina Souza', cpf: '12345678901', telefone: '11988887777' },
    { id: 2, id_cliente: 2, nome: 'Carlos Almeida', cpf: '98765432100', telefone: '11977776666' },
    { id: 3, id_cliente: 3, nome: 'Juliana Lima', cpf: '45678912300', telefone: '11966665555' },
  ],
  produtos: [
    { id: 1, nome: 'X-Burger', descricao: 'Hamburguer da casa', foto: null, valor_unitario: 24.9 },
    { id: 2, nome: 'Refrigerante lata', descricao: '350ml', foto: null, valor_unitario: 6.5 },
    { id: 3, nome: 'Porcao de fritas', descricao: 'Batata frita media', foto: null, valor_unitario: 18 },
    { id: 4, nome: 'Suco natural', descricao: 'Laranja 500ml', foto: null, valor_unitario: 9 },
    { id: 5, nome: 'Pizza brotinho', descricao: 'Mussarela', foto: null, valor_unitario: 32 },
  ],
  comandas: [
    {
      id: 101,
      comanda: '12',
      data_hora: nowIso(),
      status: 0,
      cliente_id: 1,
      funcionario_id: 0,
      funcionario: { id: 0, nome: 'Admin Local', matricula: 'LOCAL', cpf: '00000000000', telefone: '', grupo: 1 },
      cliente: { id: 1, nome: 'Marina Souza', cpf: '12345678901', telefone: '11988887777' },
      itens: [
        {
          id: 1001,
          produto_id: 1,
          produto: { id: 1, nome: 'X-Burger', descricao: 'Hamburguer da casa', foto: null, valor_unitario: 24.9 },
          quantidade: 2,
          valor_unitario: 24.9,
          valor_total: 49.8,
        },
        {
          id: 1002,
          produto_id: 2,
          produto: { id: 2, nome: 'Refrigerante lata', descricao: '350ml', foto: null, valor_unitario: 6.5 },
          quantidade: 2,
          valor_unitario: 6.5,
          valor_total: 13,
        },
      ],
    },
    {
      id: 102,
      comanda: '18',
      data_hora: nowIso(),
      status: 0,
      cliente_id: null,
      funcionario_id: 0,
      funcionario: { id: 0, nome: 'Admin Local', matricula: 'LOCAL', cpf: '00000000000', telefone: '', grupo: 1 },
      cliente: null,
      itens: [
        {
          id: 1003,
          produto_id: 3,
          produto: { id: 3, nome: 'Porcao de fritas', descricao: 'Batata frita media', foto: null, valor_unitario: 18 },
          quantidade: 1,
          valor_unitario: 18,
          valor_total: 18,
        },
        {
          id: 1004,
          produto_id: 4,
          produto: { id: 4, nome: 'Suco natural', descricao: 'Laranja 500ml', foto: null, valor_unitario: 9 },
          quantidade: 3,
          valor_unitario: 9,
          valor_total: 27,
        },
      ],
    },
    {
      id: 103,
      comanda: '27',
      data_hora: nowIso(),
      status: 0,
      cliente_id: 2,
      funcionario_id: 0,
      funcionario: { id: 0, nome: 'Admin Local', matricula: 'LOCAL', cpf: '00000000000', telefone: '', grupo: 1 },
      cliente: { id: 2, nome: 'Carlos Almeida', cpf: '98765432100', telefone: '11977776666' },
      itens: [
        {
          id: 1005,
          produto_id: 5,
          produto: { id: 5, nome: 'Pizza brotinho', descricao: 'Mussarela', foto: null, valor_unitario: 32 },
          quantidade: 1,
          valor_unitario: 32,
          valor_total: 32,
        },
      ],
    },
  ],
  recebimentos: [],
});

const getData = () => {
  const stored = sessionStorage.getItem(MOCK_STORAGE_KEY);
  if (stored) return JSON.parse(stored);

  const data = initialData();
  sessionStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
  return data;
};

const saveData = data => {
  sessionStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
  return data;
};

const getTotal = comanda => comanda.itens.reduce((total, item) => total + Number(item.valor_total || 0), 0);

const toResumo = comanda => ({
  id: comanda.id,
  comanda: comanda.comanda,
  data_hora: comanda.data_hora,
  status: comanda.status,
  cliente_id: comanda.cliente_id,
  cliente: comanda.cliente,
  funcionario_id: comanda.funcionario_id,
  funcionario: comanda.funcionario,
  total: getTotal(comanda),
  itens_count: comanda.itens.length,
});

export const mockApi = {
  getClientes: () => getData().clientes,

  getProdutos: () => getData().produtos,

  getDashboard: () => getData().comandas.filter(comanda => comanda.status === 0).map(toResumo),

  getComandasDetalhe: ids => {
    const selectedIds = ids.map(Number);
    return getData().comandas
      .filter(comanda => selectedIds.includes(comanda.id))
      .map(comanda => ({ ...toResumo(comanda), itens: comanda.itens }));
  },

  createComanda: payload => {
    const data = getData();
    const cliente = data.clientes.find(item => item.id === Number(payload.cliente_id)) || null;
    const itens = (payload.itens || []).filter(item => item.produto_id).map(item => {
      const produto = data.produtos.find(produtoItem => produtoItem.id === Number(item.produto_id));
      const quantidade = Number(item.quantidade || 1);
      const valorUnitario = Number(produto?.valor_unitario || 0);

      return {
        id: Date.now() + Math.floor(Math.random() * 1000),
        produto_id: produto?.id || Number(item.produto_id),
        produto: produto || null,
        quantidade,
        valor_unitario: valorUnitario,
        valor_total: quantidade * valorUnitario,
      };
    });

    const comanda = {
      id: Date.now(),
      comanda: String(payload.comanda),
      data_hora: nowIso(),
      status: 0,
      cliente_id: cliente?.id || null,
      funcionario_id: payload.funcionario_id || 0,
      funcionario: { id: 0, nome: 'Admin Local', matricula: 'LOCAL', cpf: '00000000000', telefone: '', grupo: 1 },
      cliente,
      itens,
    };

    data.comandas.unshift(comanda);
    saveData(data);
    return toResumo(comanda);
  },

  updateComanda: (id, payload) => {
    const data = getData();
    const cliente = data.clientes.find(item => item.id === Number(payload.cliente_id)) || null;
    const selectedItems = (payload.itens || []).filter(item => item.produto_id);
    let updatedComanda = null;

    data.comandas = data.comandas.map(comanda => {
      if (comanda.id !== Number(id)) return comanda;

      const currentItems = selectedItems.map(item => {
        const produto = data.produtos.find(produtoItem => produtoItem.id === Number(item.produto_id));
        const quantidade = Number(item.quantidade || 1);
        const valorUnitario = Number(item.valor_unitario || produto?.valor_unitario || 0);

        return {
          id: item.id || Date.now() + Math.floor(Math.random() * 1000),
          produto_id: produto?.id || Number(item.produto_id),
          produto: produto || null,
          quantidade,
          valor_unitario: valorUnitario,
          valor_total: quantidade * valorUnitario,
        };
      });

      updatedComanda = {
        ...comanda,
        comanda: String(payload.comanda),
        cliente_id: cliente?.id || null,
        cliente,
        funcionario_id: payload.funcionario_id || comanda.funcionario_id,
        itens: currentItems,
      };

      return updatedComanda;
    });

    saveData(data);
    return updatedComanda ? toResumo(updatedComanda) : null;
  },

  deleteComanda: id => {
    const data = getData();
    data.comandas = data.comandas.filter(comanda => comanda.id !== Number(id));
    saveData(data);
    return true;
  },

  receberComandas: payload => {
    const data = getData();
    const selectedIds = payload.comanda_ids.map(Number);
    const comandas = data.comandas.filter(comanda => selectedIds.includes(comanda.id) && comanda.status === 0);
    const valorBruto = comandas.reduce((total, comanda) => total + getTotal(comanda), 0);
    const desconto = Number(payload.desconto || 0);
    const acrescimo = Number(payload.acrescimo || 0);
    const cliente = data.clientes.find(item => item.id === Number(payload.cliente_id)) || null;
    const recebimento = {
      id: Date.now(),
      funcionario_id: payload.funcionario_id || 0,
      funcionario: { id: 0, nome: 'Admin Local', matricula: 'LOCAL', cpf: '00000000000', telefone: '', grupo: 1 },
      cliente_id: cliente?.id || null,
      cliente,
      valor_bruto: valorBruto,
      desconto,
      acrescimo,
      valor_total: Math.max(0, valorBruto - desconto + acrescimo),
      data_hora: nowIso(),
      comanda_ids: selectedIds,
      comandas: comandas.map(comanda => ({ ...toResumo(comanda), itens: comanda.itens })),
    };

    data.comandas = data.comandas.map(comanda => (
      selectedIds.includes(comanda.id)
        ? { ...comanda, status: 1, cliente_id: cliente?.id || comanda.cliente_id, cliente: cliente || comanda.cliente }
        : comanda
    ));
    data.recebimentos.unshift(recebimento);
    saveData(data);
    return recebimento;
  },

  getRecebimentos: () => getData().recebimentos,

  getRecebimentoById: id => getData().recebimentos.find(recebimento => recebimento.id === Number(id)),

  updateRecebimento: (id, payload) => {
    const data = getData();
    const cliente = data.clientes.find(item => item.id === Number(payload.cliente_id)) || null;
    data.recebimentos = data.recebimentos.map(recebimento => {
      if (recebimento.id !== Number(id)) return recebimento;

      const desconto = Number(payload.desconto || 0);
      const acrescimo = Number(payload.acrescimo || 0);
      return {
        ...recebimento,
        cliente_id: cliente?.id || null,
        cliente,
        desconto,
        acrescimo,
        valor_total: Math.max(0, Number(recebimento.valor_bruto || 0) - desconto + acrescimo),
      };
    });
    saveData(data);
    return data.recebimentos.find(recebimento => recebimento.id === Number(id));
  },

  deleteRecebimento: id => {
    const data = getData();
    data.recebimentos = data.recebimentos.filter(recebimento => recebimento.id !== Number(id));
    saveData(data);
    return true;
  },

  getComprovante: id => getData().recebimentos.find(recebimento => recebimento.id === Number(id)),
};
