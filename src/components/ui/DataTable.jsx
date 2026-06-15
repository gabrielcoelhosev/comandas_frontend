import { Card } from './Card';

const DataTable = ({
  columns = [],
  data = [],
  getRowKey,
  renderMobileCard,
  emptyMessage = 'Nenhum registro encontrado.',
}) => (
  <>
    <div className="desktop-table table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={getRowKey(item)}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(item) : item[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <div className="empty-state">{emptyMessage}</div>}
    </div>

    <div className="mobile-list">
      {data.map((item) => (
        <Card key={getRowKey(item)} className="entity-card">
          {renderMobileCard(item)}
        </Card>
      ))}
      {data.length === 0 && <div className="empty-state">{emptyMessage}</div>}
    </div>
  </>
);

export default DataTable;
