import TeamMember from '../models/TeamMember.js';
import { catchAsync } from '../middlewares/errorHandler.js';

// GET /api/team
export const getTeam = catchAsync(async (req, res) => {
  const members = await TeamMember.find({ ativo: true }).sort({ ordem: 1 });
  res.json({ success: true, data: members });
});

// GET /api/team/:id
export const getTeamMember = catchAsync(async (req, res) => {
  const member = await TeamMember.findOne({ _id: req.params.id, ativo: true });

  if (!member) {
    return res.status(404).json({ success: false, message: 'Membro não encontrado.' });
  }

  res.json({ success: true, data: member });
});

// POST /api/team (admin)
export const createTeamMember = catchAsync(async (req, res) => {
  const member = await TeamMember.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Membro da equipe adicionado!',
    data: member,
  });
});

// PATCH /api/team/:id (admin)
export const updateTeamMember = catchAsync(async (req, res) => {
  const member = await TeamMember.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!member) {
    return res.status(404).json({ success: false, message: 'Membro não encontrado.' });
  }

  res.json({ success: true, message: 'Membro atualizado!', data: member });
});

// DELETE /api/team/:id (admin - soft delete)
export const deleteTeamMember = catchAsync(async (req, res) => {
  const member = await TeamMember.findByIdAndUpdate(
    req.params.id,
    { ativo: false },
    { new: true }
  );

  if (!member) {
    return res.status(404).json({ success: false, message: 'Membro não encontrado.' });
  }

  res.json({ success: true, message: 'Membro removido.' });
});
