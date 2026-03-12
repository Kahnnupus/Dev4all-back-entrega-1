import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
      maxlength: [200, 'Título deve ter no máximo 200 caracteres'],
    },
    descricao: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      maxlength: [2000, 'Descrição deve ter no máximo 2000 caracteres'],
    },
    categorias: {
      type: [String],
      enum: {
        values: ['Consultoria', 'Desenvolvimento', 'Design', 'Marketing', 'Outro'],
        message: 'Categoria inválida: {VALUE}',
      },
      default: [],
    },
    imagemUrl: { type: String, default: null },
    linkExterno: { type: String, default: null },
    // true = aparece nos destaques da home
    destaque: { type: Boolean, default: false },
    // soft delete
    ativo: { type: Boolean, default: true },
    criadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Projeto deve ter um criador'],
    },
  },
  { timestamps: true }
);

projectSchema.index({ destaque: 1, ativo: 1 });
projectSchema.index({ categorias: 1 });
projectSchema.index({ criadoPor: 1 });

export default mongoose.model('Project', projectSchema);
