import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
    },
    cargo: {
      type: String,
      required: [true, 'Cargo é obrigatório'],
      trim: true,
      maxlength: [100, 'Cargo deve ter no máximo 100 caracteres'],
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio deve ter no máximo 500 caracteres'],
      default: '',
    },
    fotoUrl: { type: String, default: null },
    linkedinUrl: { type: String, default: null },
    githubUrl: { type: String, default: null },
    cor: { type: String, default: '#2563eb' },
    ordem: { type: Number, default: 0 },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

teamMemberSchema.index({ ordem: 1 });

export default mongoose.model('TeamMember', teamMemberSchema);
