import { FiberNew, People, PictureAsPdf } from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ActionButtons from '../components/common/ActionButtons';
import ListToolbar from '../components/common/ListToolbar';
import PageLayout from '../components/common/PageLayout';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import { deleteFuncionario, getFuncionarios } from '../services/funcionarioService';

function FuncionarioList() {
  const navigate = useNavigate();
  const [funcionarios, setFuncionarios] = useState([]);

  const fetchFuncionarios = useCallback(async () => {
    try {
      const data = await getFuncionarios();
      setFuncionarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      toast.error('Erro ao buscar funcionários.', { position: 'top-center' });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFuncionarios();
  }, [fetchFuncionarios]);

  const handleDeleteConfirm = async (id) => {
    try {
      await deleteFuncionario(id);
      await fetchFuncionarios();
      toast.dismiss();
      toast.success('Funcionário excluído com sucesso!', { position: 'top-center' });
    } catch (error) {
      console.error('Erro ao deletar funcionário:', error);
      toast.error('Erro ao excluir funcionário.', { position: 'top-center' });
    }
  };

  const handleDeleteClick = (funcionario) => {
    toast(
      <div>
        <p>
          Tem certeza que deseja excluir o funcionário <strong>{funcionario.nome}</strong>?
        </p>
        <div className="dialog-actions" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
          <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirm(funcionario.id_funcionario)}>
            Excluir
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.dismiss()}>
            Cancelar
          </Button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      },
    );
  };

  const handleGeneratePdf = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Funcionários', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['ID', 'Nome', 'CPF', 'Matrícula', 'Telefone', 'Grupo']],
      body: funcionarios.map((funcionario) => [
        funcionario.id_funcionario,
        funcionario.nome,
        funcionario.cpf,
        funcionario.matricula,
        funcionario.telefone,
        funcionario.grupo,
      ]),
    });
    doc.save('relatorio_funcionarios.pdf');
  };

  const columns = [
    { key: 'id_funcionario', header: 'ID' },
    { key: 'nome', header: 'Nome', render: (funcionario) => <strong>{funcionario.nome}</strong> },
    { key: 'cpf', header: 'CPF' },
    { key: 'matricula', header: 'Matrícula' },
    { key: 'telefone', header: 'Telefone' },
    { key: 'grupo', header: 'Grupo', render: (funcionario) => <span className="badge">{funcionario.grupo}</span> },
    {
      key: 'actions',
      header: 'Ações',
      render: (funcionario) => (
        <ActionButtons
          item={funcionario}
          onView={() => navigate(`/funcionario/view/${funcionario.id_funcionario}`)}
          onEdit={() => navigate(`/funcionario/edit/${funcionario.id_funcionario}`)}
          onDelete={handleDeleteClick}
        />
      ),
    },
  ];

  const renderMobileCard = (funcionario) => (
    <>
      <div className="entity-card__header">
        <div>
          <p className="entity-card__title">{funcionario.nome}</p>
          <p className="entity-card__meta">{`ID ${funcionario.id_funcionario} - CPF ${funcionario.cpf}`}</p>
        </div>
        <span className="badge">{funcionario.grupo}</span>
      </div>
      <div className="entity-card__grid">
        <span>{`Matrícula: ${funcionario.matricula || '-'}`}</span>
        <span>{`Telefone: ${funcionario.telefone || '-'}`}</span>
      </div>
      <ActionButtons
        item={funcionario}
        onView={() => navigate(`/funcionario/view/${funcionario.id_funcionario}`)}
        onEdit={() => navigate(`/funcionario/edit/${funcionario.id_funcionario}`)}
        onDelete={handleDeleteClick}
      />
    </>
  );

  return (
    <PageLayout title="Funcionários" description="Equipe, perfis de acesso e contatos">
      <ListToolbar
        icon={<People />}
        title="Funcionários"
        description={`${funcionarios.length} registro(s) encontrados`}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/funcionario')}>
              <FiberNew />
              Novo
            </Button>
            <Button variant="outline" onClick={handleGeneratePdf}>
              <PictureAsPdf />
              Gerar PDF
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={funcionarios}
        getRowKey={(funcionario) => funcionario.id_funcionario}
        renderMobileCard={renderMobileCard}
      />
    </PageLayout>
  );
}

export default FuncionarioList;
