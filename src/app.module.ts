import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, Module } from '@nestjs/common';
import config from './common/config/config';

import { AuthModule } from "./auth/auth.module";
import { RegisterModule } from "./register/register.module";
import { LoginModule } from "./login/login.module";
import { ModelsModule } from "./typeorm/models/models.module";
import { WebsocketModule } from "./websocket/websocket.module";
import { ChatingMessageModule } from "./chating_message/chating_message.module";
import { InfoModule } from "./info/info.module";
import { FriendsModule } from "./friends/friends.module";
import { GroupModule } from "./group/group.module";
import { UserModule } from "./user/user.module";
import { DialogModule } from "./dialog/dialog.module";
import { UploadModule } from "./upload/upload.module";
import { UserSettingModule } from "./userSetting/userSetting.module";
import { TopicModule } from "./topic/topic.module"
import { SystemModule } from "./system/system.module";
import { RechargeModule } from "./recharge/recharge.module";

@Module({
    imports: [
        // CacheModule.register({
        //     store: redisStore,
        //     host: config.redis.host,
        //     port: config.redis.port,
        //     ttl: 600
        // }),
        AuthModule,
        ModelsModule,
        RegisterModule,
        LoginModule,
        WebsocketModule,
        ChatingMessageModule,
        InfoModule,
        FriendsModule,
        GroupModule,
        UserModule,
        DialogModule,
        UploadModule,
        UserSettingModule,
        TopicModule,
        SystemModule,
        RechargeModule
    ],
    exports: [],
    providers: [],
    controllers: []
})
export class AppModule { }