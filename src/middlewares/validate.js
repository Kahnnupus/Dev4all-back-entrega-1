export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(422).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.details.map((d) => d.message),
    });
  }

  next();
};
