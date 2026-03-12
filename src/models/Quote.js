import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema(
  {
    nomeCompleto: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      maxlength: [120, 'Nome deve ter no máximo 120 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Email inválido'],
    },
    telefone: {
      type: String,
      required: [true, 'Telefone é obrigatório'],
      trim: true,
      maxlength: [20, 'Telefone deve ter no máximo 20 caracteres'],
    },
    tipoServico: {
      type: [String],
      enum: {
        values: ['Consultoria', 'Desenvolvimento', 'Design', 'Marketing', 'Outro'],
        message: 'Tipo de serviço inválido: {VALUE}',
      },
      validate: {
        validator: (arr) => arr && arr.length > 0,
        message: 'Selecione ao menos um tipo de serviço',
      },
      required: [true, 'Tipo de serviço é obrigatório'],
    },
    descricao: {
      type: String,
      required: [true, 'Descrição do projeto é obrigatória'],
      maxlength: [3000, 'Descrição deve ter no máximo 3000 caracteres'],
    },
    status: {
      type: String,
      enum: {
        values: ['pendente', 'em_analise', 'aprovado', 'rejeitado'],
        message: 'Status inválido: {VALUE}',
      },
      default: 'pendente',
    },
    // null = enviado sem login
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

quoteSchema.index({ createdAt: -1 });
quoteSchema.index({ usuario: 1 });
quoteSchema.index({ status: 1 });

export default mongoose.model('Quote', quoteSchema);
