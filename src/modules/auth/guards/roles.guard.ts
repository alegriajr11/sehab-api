import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import { AppRoleType } from '../../../common/constants/app-role.constant';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AppRoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
    }>();

    if (!user) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'No tiene permisos para realizar esta operación.',
      });
    }

    if (!requiredRoles.includes(user.rolNombre)) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'No tiene permisos para realizar esta operación.',
      });
    }

    return true;
  }
}
