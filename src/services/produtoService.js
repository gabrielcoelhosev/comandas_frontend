import api from './api';
import { API_ENDPOINTS } from '../config/apiConfig';
import { isLocalAdmin, mockApi } from './mockData';

const { PRODUTO } = API_ENDPOINTS;

const endpointWithId = (endpoint, id) => endpoint.replace(':id', id);

const extractData = response => response.data;

const sanitizePayload = data => ({
    nome: data.nome,
    descricao: data.descricao,
    valor_unitario: Number(data.valor_unitario),
    foto: data.foto || null,
});

export const getProdutos = async () => {
    if (isLocalAdmin()) return mockApi.getProdutos();

    const response = await api.get(PRODUTO.LIST);
    return extractData(response);
};

export const getProdutoById = async id => {
    const response = await api.get(endpointWithId(PRODUTO.GET, id));
    return extractData(response);
};

export const createProduto = async data => {
    const response = await api.post(PRODUTO.CREATE, sanitizePayload(data));
    return extractData(response);
};

export const updateProduto = async (id, data) => {
    const response = await api.put(endpointWithId(PRODUTO.UPDATE, id), sanitizePayload(data));
    return extractData(response);
};

export const deleteProduto = async id => {
    await api.delete(endpointWithId(PRODUTO.DELETE, id));
    return true;
};
