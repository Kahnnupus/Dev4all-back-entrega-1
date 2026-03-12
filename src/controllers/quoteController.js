import Quote from '../models/Quote.js';
import { catchAsync } from '../middlewares/errorHandler.js';


export const createQuote = catchAsync(async (req, res) => {
  const quoteData = { ...req.body };


  if (req.user) quoteData.usuario = req.user._id;

  const quote = await Quote.create(quoteData);

  res.status(201).json({
    success: true,
    message: 'Orçamento enviado com sucesso! Nossa equipe entrará em contato em breve.',
    data: quote,
  });
});


export const getQuotes = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    Quote.find(filter)
      .populate('usuario', 'nomeCompleto email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Quote.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});


export const getMyQuotes = catchAsync(async (req, res) => {
  const quotes = await Quote.find({ usuario: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: quotes });
});


export const getQuote = catchAsync(async (req, res) => {
  const quote = await Quote.findById(req.params.id).populate('usuario', 'nomeCompleto email');

  if (!quote) {
    return res.status(404).json({ success: false, message: 'Orçamento não encontrado.' });
  }


  const isOwner = req.user.role === 'admin' ||
    (quote.usuario && quote.usuario._id.toString() === req.user._id.toString());

  if (!isOwner) {
    return res.status(403).json({ success: false, message: 'Acesso negado.' });
  }

  res.json({ success: true, data: quote });
});


export const updateQuoteStatus = catchAsync(async (req, res) => {
  const quote = await Quote.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );

  if (!quote) {
    return res.status(404).json({ success: false, message: 'Orçamento não encontrado.' });
  }

  res.json({ success: true, message: 'Status atualizado!', data: quote });
});


export const deleteQuote = catchAsync(async (req, res) => {
  const quote = await Quote.findByIdAndDelete(req.params.id);

  if (!quote) {
    return res.status(404).json({ success: false, message: 'Orçamento não encontrado.' });
  }

  res.json({ success: true, message: 'Orçamento removido.' });
});
