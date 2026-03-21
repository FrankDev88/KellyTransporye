import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Agrega lógica de autenticación personalizada aquí si es necesario
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Puedes lanzar una excepción basada en si se encontró o no el usuario
    if (err || !user) {
      throw err || new UnauthorizedException('No tienes autorización para acceder a este recurso.');
    }
    return user;
  }
}
