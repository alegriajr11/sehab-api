import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

export const RequestMeta = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestMeta => {
    const request = ctx.switchToHttp().getRequest<{
      ip?: string;
      headers: Record<string, string | string[] | undefined>;
    }>();
    const forwarded = request.headers['x-forwarded-for'];
    const ip =
      (typeof forwarded === 'string' ? forwarded.split(',')[0] : undefined) ??
      request.ip;
    const userAgent = request.headers['user-agent'];
    return {
      ip,
      userAgent: typeof userAgent === 'string' ? userAgent : undefined,
    };
  },
);
