import api from './api';
import { API_ENDPOINTS } from '../config/apiConfig';
import { isLocalAdmin, mockApi } from './mockData';

const { RECEBIMENTO } = API_ENDPOINTS;

const endpointWithId = (endpoint, id) => endpoint.replace(':id', id);
const extractData = response => response.data;

const sanitizeMoney = value => Number(value || 0);

export const getCaixaDashboard = async () => {
  if (isLocalAdmin()) return mockApi.getDashboard();

  const response = await api.get(RECEBIMENTO.DASHBOARD);
  return extractData(response);
};

export const getComandasDetalhe = async ids => {
  if (isLocalAdmin()) return mockApi.getComandasDetalhe(ids);

  const response = await api.get(RECEBIMENTO.DETALHE.replace(':ids', ids.join(',')));
  return extractData(response);
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
