import Button from './Button';

const Dialog = ({
  open,
  title,
  children,
  actions,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose || undefined}>
      <div className="dialog" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog__header">
          <h2 className="dialog__title">{title}</h2>
        </div>
        <div className="dialog__content">{children}</div>
        <div className="dialog__footer">
          <div className="dialog-actions">
            {actions || (
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
