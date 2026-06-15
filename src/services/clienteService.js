import api from './api';
import { API_ENDPOINTS } from '../config/apiConfig';
import { isLocalAdmin, mockApi } from './mockData';

const { CLIENTE } = API_ENDPOINTS;

const endpointWithId = (endpoint, id) => endpoint.replace(':id', id);

const normalizeCliente = cliente => ({
  ...cliente,
  id_cliente: cliente.id,
});

const normalizeClientes = clientes => clientes.map(normalizeCliente);

const extractData = response => response.data;

export const createCliente = async data => {
  const response = await api.post(CLIENTE.CREATE, data);
  return normalizeCliente(extractData(response));
};

export const updateCliente = async (id, data) => {
  const response = await api.put(endpointWithId(CLIENTE.UPDATE, id), data);
  return normalizeCliente(extractData(response));
};

export const getClienteById = async id => {
  const response = await api.get(endpointWithId(CLIENTE.GET, id));
  return normalizeCliente(extractData(response));
};

export const checkCpfExists = async cpf => {
  const response = await api.get(CLIENTE.LIST);
  const cliente = extractData(response).find(item => item.cpf === cpf);

  return {
    exists: !!cliente,
    cliente: cliente ? normalizeCliente(cliente) : null,
  };
};

export const deleteCliente = async id => {
  await api.delete(endpointWithId(CLIENTE.DELETE, id));
  return true;
};

export const getClientes = async () => {
  if (isLocalAdmin()) return mockApi.getClientes();

  const response = await api.get(CLIENTE.LIST);
  return normalizeClientes(extractData(response));
};
