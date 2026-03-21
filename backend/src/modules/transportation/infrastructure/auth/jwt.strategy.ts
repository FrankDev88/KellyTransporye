import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super_secret_fallback_key',
    });
  }

  async validate(payload: JwtPayload) {
    // Aquí podríamos validar si el usuario sigue existiendo o activo en la DB si lo deseamos,
    // pero para mantenerlo stateless, nos conformamos con la validación del token.
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
    
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
