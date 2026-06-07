import api from './api';
import { API_ENDPOINTS } from '../config/apiConfig';

const { FUNCIONARIO } = API_ENDPOINTS;

const endpointWithId = (endpoint, id) => endpoint.replace(':id', id);

const normalizeFuncionario = funcionario => ({
  ...funcionario,
  id_funcionario: funcionario.id,
  grupo: String(funcionario.grupo),
});

const normalizeFuncionarios = funcionarios => funcionarios.map(normalizeFuncionario);

const extractData = response => response.data;

const sanitizePayload = data => {
  const payload = {
    ...data,
    grupo: Number(data.grupo),
  };

  if (!payload.senha) {
    delete payload.senha;
  }

  return payload;
};

export const getFuncionarios = async () => {
  const response = await api.get(FUNCIONARIO.LIST);
  return normalizeFuncionarios(extractData(response));
};

export const getFuncionarioById = async id => {
  const response = await api.get(endpointWithId(FUNCIONARIO.GET, id));
  return normalizeFuncionario(extractData(response));
};

export const deleteFuncionario = async id => {
  await api.delete(endpointWithId(FUNCIONARIO.DELETE, id));
  return true;
};

export const createFuncionario = async data => {
  const response = await api.post(FUNCIONARIO.CREATE, sanitizePayload(data));
  return normalizeFuncionario(extractData(response));
};

export const updateFuncionario = async (id, data) => {
  const response = await api.put(endpointWithId(FUNCIONARIO.UPDATE, id), sanitizePayload(data));
  return normalizeFuncionario(extractData(response));
};

export const checkCpfExists = async cpf => {
  const response = await api.get(FUNCIONARIO.LIST, {
    params: { cpf },
  });
  const funcionario = extractData(response).find(item => item.cpf === cpf);

  return {
    exists: !!funcionario,
    funcionario: funcionario ? normalizeFuncionario(funcionario) : null,
  };
};
