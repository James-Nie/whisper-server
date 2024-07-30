import './common/log/log4js';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { getLogger } from 'xmcommon';

import {HttpServiceResponseInterceptor} from './common/interceptor/response.interceptor'
 
import { NestLogger } from './common/log/nest.logger';
const log = getLogger(__filename);  // 这样构造日志，就可以在输出的地方，打印出对应的文件
log.info('程序开始启动...');

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new NestLogger()
  });

  app.useStaticAssets(join(__dirname, '..', 'public/static'), {
    prefix: '/static',
  });

  // 设置全局路由前缀
  app.setGlobalPrefix('api');

  // 增加HTTP服务的成功响应拦截器
  app.useGlobalInterceptors(new HttpServiceResponseInterceptor());

  if (process.env.NODE_ENV === 'dev') {
    // swagger配置
    const swaggerConfig = new DocumentBuilder()
      .setTitle('APIs')
      .setDescription('Nestjs APIs documents')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, document);
  }

  const port = 3000;

  await app.listen(port);

  log.info(`nestjs服务 ${port}`);
}
bootstrap();
