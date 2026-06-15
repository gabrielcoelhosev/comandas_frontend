export const Card = ({ children, className = '', elevated = false, ...props }) => (
  <section className={`card ${className}`.trim()} data-elevated={elevated} {...props}>
    {children}
  </section>
);

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`card__header ${className}`.trim()} {...props}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`card__content ${className}`.trim()} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`card__footer ${className}`.trim()} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h2 className={`card__title ${className}`.trim()} {...props}>
    {children}
  </h2>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`card__description ${className}`.trim()} {...props}>
    {children}
  </p>
);
