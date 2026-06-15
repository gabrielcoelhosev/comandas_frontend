const FieldShell = ({ label, error, children }) => (
  <label className="field-group">
    <span className="field-label">{label}</span>
    {children}
    <span className="field-error">{error || ''}</span>
  </label>
);

export const FormField = ({
  label,
  error,
  multiline = false,
  inputComponent: InputComponent,
  inputProps,
  ...props
}) => {
  const Control = InputComponent || (multiline ? 'textarea' : 'input');
  const className = multiline ? 'textarea' : 'input';

  return (
    <FieldShell label={label} error={error}>
      <Control className={className} {...inputProps} {...props} />
    </FieldShell>
  );
};

export const SelectField = ({ label, error, options = [], ...props }) => (
  <FieldShell label={label} error={error}>
    <select className="select" {...props}>
      <option value="">Selecione</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </FieldShell>
);

export default FormField;
