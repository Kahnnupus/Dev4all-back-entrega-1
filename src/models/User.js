import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    nomeCompleto: {
      type: String,
      required: [true, 'Nome completo é obrigatório'],
      trim: true,
      maxlength: [120, 'Nome deve ter no máximo 120 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Email inválido'],
    },
    senha: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [4, 'Senha deve ter no mínimo 4 caracteres'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('quotes', {
  ref: 'Quote',
  localField: '_id',
  foreignField: 'usuario',
});


userSchema.pre('save', async function () {
  if (!this.isModified('senha')) return;
  this.senha = await bcrypt.hash(this.senha, 12);
});

userSchema.methods.senhaCorreta = async function (candidata) {
  return bcrypt.compare(candidata, this.senha);
};

export default mongoose.model('User', userSchema);
