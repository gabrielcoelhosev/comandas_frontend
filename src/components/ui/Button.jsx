const Button = ({
  as: Component = 'button',
  children,
  className = '',
  variant = 'default',
  size = 'default',
  type,
  ...props
}) => (
  <Component
    className={`button ${className}`.trim()}
    data-size={size}
    data-variant={variant}
    type={Component === 'button' ? type || 'button' : undefined}
    {...props}
  >
    {children}
  </Component>
);

export default Button;
