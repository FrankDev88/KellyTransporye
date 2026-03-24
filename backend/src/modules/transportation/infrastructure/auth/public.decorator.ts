import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca un endpoint como público (no requiere JWT).
 * Ejemplo: @Public() en el endpoint de login.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
