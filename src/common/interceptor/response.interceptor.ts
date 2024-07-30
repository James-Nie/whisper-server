import {CallHandler, ExecutionContext, NestInterceptor, Logger} from "@nestjs/common";
import {map, Observable} from "rxjs";
import { ServerResponseWrapper } from "../interfaces/common.interface";
import { format } from 'util';

/**
 * 全局Http服务响应拦截器
 * 该Interceptor在main中通过
 * app.useGlobalInterceptors 来全局引入，
 * 仅处理HTTP服务成功响应拦截，异常是不会进入该拦截器
 */
export class HttpServiceResponseInterceptor implements NestInterceptor {
    private readonly logger = new Logger(); // 实例化日志记录器

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
        const start = Date.now(); // 请求开始时间

        return next.handle().pipe(map(data => {
            const host = context.switchToHttp();
            const request = host.getRequest<Request>();

            // 打印请求方法，请求链接，处理时间和响应数据
            this.logger.log(format(
                '%s %s %dms %s',
                request.method,
                request.url,
                Date.now() - start,
            ));

            // 进入该拦截器，说明没有异常，使用成功返回
            const resp: ServerResponseWrapper = {
                success: true,
                code: 200,
                data: data
            };
            return resp;
        }))
    }
}