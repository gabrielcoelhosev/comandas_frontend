import api from './api';
import { API_ENDPOINTS } from '../config/apiConfig';
import { isLocalAdmin, mockApi } from './mockData';
import { getProdutos } from './produtoService';

const { RECEBIMENTO } = API_ENDPOINTS;

const endpointWithId = (endpoint, id) => endpoint.replace(':id', id);
const extractData = response => response.data;

const sanitizeMoney = value => Number(value || 0);

const getProdutoId = produto => produto?.id ?? produto?.id_produto ?? produto?.produto_id;

const normalizeText = value => String(value || '').trim().toLowerCase();

const normalizePhoto = foto => {
  if (!foto) return null;

  if (Array.isArray(foto)) {
    const text = String.fromCharCode(...foto);
    return normalizePhoto(text);
  }

  if (typeof foto === 'object') {
    if (Array.isArray(foto.data)) return normalizePhoto(foto.data);
    return null;
  }

  let value = String(foto).trim();

  if (!value) return null;

  const bytesMatch = value.match(/^b(['"])(.*)\1$/);
  if (bytesMatch) {
    value = bytesMatch[2].replace(/\\n/g, '').replace(/\\'/g, "'").replace(/\\"/g, '"');
  }

  if (value.startsWith('data:image/')) return value;
  if (value.startsWith('/9j/')) return `data:image/jpeg;base64,${value}`;
  if (value.startsWith('iVBOR')) return `data:image/png;base64,${value}`;
  if (value.startsWith('R0lGOD')) return `data:image/gif;base64,${value}`;
  if (value.startsWith('UklGR')) return `data:image/webp;base64,${value}`;

  return value;
};

const createProdutosById = produtos => new Map(
  produtos
    .filter(produto => getProdutoId(produto) !== undefined && getProdutoId(produto) !== null)
    .map(produto => [String(getProdutoId(produto)), produto]),
);

const createProdutosByName = produtos => new Map(
  produtos
    .filter(produto => produto?.nome)
    .map(produto => [normalizeText(produto.nome), produto]),
);

const enrichComandasWithProdutos = (comandas, produtos) => {
  const produtosById = createProdutosById(produtos);
  const produtosByName = createProdutosByName(produtos);

  return comandas.map(comanda => ({
    ...comanda,
    itens: (comanda.itens || []).map(item => {
      const produtoId = item.produto_id ?? item.id_produto ?? getProdutoId(item.produto);
      const produto = produtosById.get(String(produtoId))
        || produtosByName.get(normalizeText(item.produto?.nome));
      const itemPhoto = normalizePhoto(item.produto?.foto || item.foto);
      const productPhoto = normalizePhoto(produto?.foto);

      if (!produto && !itemPhoto) return item;

      return {
        ...item,
        produto: {
          ...produto,
          ...item.produto,
          foto: itemPhoto || productPhoto || null,
        },
      };
    }),
  }));
};

const withProductPhotos = async comandas => {
  if (!Array.isArray(comandas) || comandas.length === 0) return comandas;

  try {
    const produtos = await getProdutos();
    return enrichComandasWithProdutos(comandas, Array.isArray(produtos) ? produtos : []);
  } catch {
    return comandas;
  }
};

export const getCaixaDashboard = async () => {
  if (isLocalAdmin()) return mockApi.getDashboard();

  const response = await api.get(RECEBIMENTO.DASHBOARD);
  return extractData(response);
};

export const getComandasDetalhe = async ids => {
  if (isLocalAdmin()) return withProductPhotos(mockApi.getComandasDetalhe(ids));

  const response = await api.get(RECEBIMENTO.DETALHE.replace(':ids', ids.join(',')));
  return withProductPhotos(extractData(response));
};

export const receberComandas = async data => {
  if (isLocalAdmin()) return mockApi.receberComandas(data);

  const response = await api.post(RECEBIMENTO.RECEBER, {
    comanda_ids: data.comanda_ids,
    funcionario_id: data.funcionario_id || undefined,
    cliente_id: data.cliente_id || undefined,
    desconto: sanitizeMoney(data.desconto),
    acrescimo: sanitizeMoney(data.acrescimo),
  });
  return extractData(response);
};

export const getRecebimentos = async () => {
  if (isLocalAdmin()) return mockApi.getRecebimentos();

  const response = await api.get(RECEBIMENTO.LIST);
  return extractData(response);
};

export const getRecebimentoById = async id => {
  if (isLocalAdmin()) return mockApi.getRecebimentoById(id);

  const response = await api.get(endpointWithId(RECEBIMENTO.GET, id));
  return extractData(response);
};

export const updateRecebimento = async (id, data) => {
  if (isLocalAdmin()) return mockApi.updateRecebimento(id, data);

  const response = await api.put(endpointWithId(RECEBIMENTO.UPDATE, id), {
    funcionario_id: data.funcionario_id || undefined,
    cliente_id: data.cliente_id || undefined,
    desconto: sanitizeMoney(data.desconto),
    acrescimo: sanitizeMoney(data.acrescimo),
  });
  return extractData(response);
};

export const deleteRecebimento = async id => {
  if (isLocalAdmin()) return mockApi.deleteRecebimento(id);

  await api.delete(endpointWithId(RECEBIMENTO.DELETE, id));
  return true;
};

export const getComprovante = async id => {
  if (isLocalAdmin()) return mockApi.getComprovante(id);

  const response = await api.get(endpointWithId(RECEBIMENTO.COMPROVANTE, id));
  return extractData(response);
};
