import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus, Inject, HttpException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as jwt from "jwt-simple";
import { jwtConfig } from "../config/config";

@Injectable()
export class VipInterceptor implements NestInterceptor {
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const accessToken = request.headers['accesstoken'];
    
    if(!accessToken) {
      return ctx.getResponse().status(HttpStatus.FORBIDDEN).json({
        success: false,
        code: HttpStatus.FORBIDDEN,
        message: '用户登录失效，请重新登录',
      }).send();
    }
    

    return next.handle().pipe(map(data => ( data )));
  }
}