import { Module } from "@nestjs/common";
import { _UserService } from "./user.service";
import { UserController } from "./user.controller";
import { ModelsModule } from "../typeorm/models/models.module";
import { AuthService } from "../auth/auth.service";
@Module({
    providers: [_UserService, AuthService],
    controllers: [UserController],
    imports: [ModelsModule],
    exports: [_UserService, AuthService]
})
export class UserModule {}