import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus, Inject, HttpException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as jwt from "jwt-simple";
import { jwtConfig } from "../config/config";

/**
  * 解码Token
  * @param accessToken 
*/
function decodeToken(accessToken: string) {
  try {
    return jwt.decode(accessToken, jwtConfig.jwtSecret);
  }catch(e) {
    throw new HttpException("无效Token，此为非法登录", HttpStatus.FORBIDDEN);
  }
}

@Injectable()
export class LoginInterceptor implements NestInterceptor {
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const accessToken = request.headers['accesstoken'];
    
    if(!accessToken) {
      console.log('accessToken===', accessToken, request.url)

      return ctx.getResponse().status(HttpStatus.FORBIDDEN).json({
        success: false,
        code: HttpStatus.FORBIDDEN,
        message: '用户登录失效，请重新登录',
      }).send();
    }
    const validateToken  = decodeToken(accessToken);

    if(validateToken.expires < Date.now()) {
      return ctx.getResponse().status(HttpStatus.FORBIDDEN).json({
        success: false,
        code: HttpStatus.FORBIDDEN,
        message: '用户登录失效，请重新登录',
      }).send();
    }

    return next.handle().pipe(map(data => ( data )));
  }
}