import { Module } from "@nestjs/common";

import { ModelsModule } from "../typeorm/models/models.module";
import { AuthModule } from "../auth/auth.module";
import { WebsocketModule } from "../websocket/websocket.module";
import { LoginController } from "./login.controller";
import { LoginService } from "./login.service";
import { AuthService } from "../auth/auth.service";

@Module({
    imports: [ModelsModule, AuthModule, WebsocketModule],
    controllers: [LoginController],
    providers: [LoginService, AuthService]
})
export class LoginModule { }