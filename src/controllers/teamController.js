import TeamMember from '../models/TeamMember.js';
import { catchAsync } from '../middlewares/errorHandler.js';


export const getTeam = catchAsync(async (req, res) => {
  const members = await TeamMember.find({ ativo: true }).sort({ ordem: 1 });
  res.json({ success: true, data: members });
});


export const getTeamMember = catchAsync(async (req, res) => {
  const member = await TeamMember.findOne({ _id: req.params.id, ativo: true });

  if (!member) {
    return res.status(404).json({ success: false, message: 'Membro não encontrado.' });
  }

  res.json({ success: true, data: member });
});


export const createTeamMember = catchAsync(async (req, res) => {
  const member = await TeamMember.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Membro da equipe adicionado!',
    data: member,
  });
});


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
