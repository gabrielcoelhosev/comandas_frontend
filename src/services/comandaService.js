import api from './api';
import { API_ENDPOINTS } from '../config/apiConfig';
import { isLocalAdmin, mockApi } from './mockData';

const { COMANDA, RECEBIMENTO } = API_ENDPOINTS;

const endpointWithId = (endpoint, id) => endpoint.replace(':id', id);
const extractData = response => response.data;

const sanitizeItem = (item, data) => ({
  produto_id: Number(item.produto_id),
  quantidade: Number(item.quantidade || 1),
  funcionario_id: Number(item.funcionario_id || data.funcionario_id),
  valor_unitario: Number(item.valor_unitario || 0),
});

export const createComanda = async data => {
  if (isLocalAdmin()) return mockApi.createComanda(data);

  const payload = {
    comanda: data.comanda,
    cliente_id: data.cliente_id || undefined,
    funcionario_id: data.funcionario_id || undefined,
    status: 0,
  };

  const response = await api.post(COMANDA.CREATE, payload);
  const comanda = extractData(response);

  const items = (data.itens || []).filter(item => item.produto_id);
  for (const [index, item] of items.entries()) {
    try {
      await api.post(endpointWithId(COMANDA.ADD_ITEM, comanda.id), sanitizeItem(item, data));
    } catch (error) {
      error.apiMessage = `Item ${index + 1}: ${error.apiMessage || error.message}`;
      throw error;
    }
  }

  return comanda;
};

export const updateComanda = async (id, data) => {
  if (isLocalAdmin()) return mockApi.updateComanda(id, data);

  const payload = {
    comanda: data.comanda,
    cliente_id: data.cliente_id || undefined,
    funcionario_id: data.funcionario_id || undefined,
    status: 0,
  };

  const response = await api.put(endpointWithId(COMANDA.UPDATE, id), payload);
  const comanda = extractData(response);
  const items = (data.itens || []).filter(item => item.produto_id);
  const currentItemIds = items.filter(item => item.id).map(item => Number(item.id));
  const removedItemIds = (data.original_item_ids || []).filter(itemId => !currentItemIds.includes(Number(itemId)));

  for (const itemId of removedItemIds) {
    await api.delete(endpointWithId(COMANDA.REMOVE_ITEM, itemId));
  }

  for (const [index, item] of items.entries()) {
    try {
      const payloadItem = sanitizeItem(item, data);
      if (item.id) {
        await api.put(endpointWithId(COMANDA.UPDATE_ITEM, item.id), payloadItem);
      } else {
        await api.post(endpointWithId(COMANDA.ADD_ITEM, id), payloadItem);
      }
    } catch (error) {
      error.apiMessage = `Item ${index + 1}: ${error.apiMessage || error.message}`;
      throw error;
    }
  }

  return comanda;
};

export const deleteComanda = async id => {
  if (isLocalAdmin()) return mockApi.deleteComanda(id);

  const detailResponse = await api.get(RECEBIMENTO.DETALHE.replace(':ids', id));
  const comanda = extractData(detailResponse)?.[0];
  const itemIds = (comanda?.itens || []).map(item => item.id).filter(Boolean);

  for (const [index, itemId] of itemIds.entries()) {
    try {
      await api.delete(endpointWithId(COMANDA.REMOVE_ITEM, itemId));
    } catch (error) {
      error.apiMessage = `Item ${index + 1}: ${error.apiMessage || error.message}`;
      throw error;
    }
  }

  await api.delete(endpointWithId(COMANDA.DELETE, id));
  return true;
};
