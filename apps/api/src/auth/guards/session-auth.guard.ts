import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

// Extend Express Session to include our user data
declare module 'express-session' {
  interface SessionData {
    userId: string;
    user: {
      id: string;
      username: string;
      email?: string;
      walletAddress?: string;
    };
  }
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    if (!request.session?.userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Attach user to request for easy access in controllers
    (request as any).user = request.session.user;
    
    return true;
  }
}
