import { UserRole } from '../common/enums';

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}
