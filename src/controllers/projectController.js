import Project from '../models/Project.js';
import { catchAsync } from '../middlewares/errorHandler.js';


export const getProjects = catchAsync(async (req, res) => {
  const { categoria, destaque, page = 1, limit = 9 } = req.query;

  const filter = { ativo: true };
  if (categoria) filter.categorias = categoria;
  if (destaque !== undefined) filter.destaque = destaque === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    Project.find(filter)
      .populate('criadoPor', 'nomeCompleto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Project.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});


export const getProject = catchAsync(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, ativo: true })
    .populate('criadoPor', 'nomeCompleto email');

  if (!project) {
    return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });
  }

  res.json({ success: true, data: project });
});


export const createProject = catchAsync(async (req, res) => {
  const project = await Project.create({ ...req.body, criadoPor: req.user._id });

  res.status(201).json({
    success: true,
    message: 'Projeto criado com sucesso!',
    data: project,
  });
});


export const updateProject = catchAsync(async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!project) {
    return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });
  }

  res.json({ success: true, message: 'Projeto atualizado!', data: project });
});


export const deleteProject = catchAsync(async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { ativo: false },
    { new: true }
  );

  if (!project) {
    return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });
  }

  res.json({ success: true, message: 'Projeto removido com sucesso.' });
});
