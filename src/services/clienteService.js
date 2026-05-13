export const createCliente = async data => {
  return {
    id: 1,
    ...data
  };
};
export const updateCliente = async (id, data) => {
  return {
    id,
    ...data
  };
};
export const getClienteById = async id => {
  return {
    id_cliente: id,
    nome: "Gabriel",
    cpf: "12345678900",
    telefone: "49999999999"
  };
};
export const checkCpfExists = async () => {
  return {
    exists: false
  };
};
export const deleteCliente = async id => {
  return true;
};
export const getClientes = async () => {
  return [{
    id_cliente: 1,
    nome: "Gabriel",
    cpf: "12345678900",
    telefone: "49999999999"
  }];
};
