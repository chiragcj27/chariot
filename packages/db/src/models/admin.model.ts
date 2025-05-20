import { Schema } from 'mongoose';
import {User} from "./user.model"

interface IAdmin extends Document {
  isSuperAdmin: boolean;
  permissions: string[];
}

const adminSchema = new Schema<IAdmin>({
  isSuperAdmin: {
    type: Boolean,
    default: false,
  },
  permissions: {
    type: [String],
    default: [],
  },
},);

export const Admin = User.discriminator<IAdmin>("admin", adminSchema);
