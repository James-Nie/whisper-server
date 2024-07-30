import { Module } from "@nestjs/common";

import { FriendsService } from "./friends.service";
import { ModelsModule } from "../typeorm/models/models.module";
import { _UserService } from "../user/user.service";
import { FriedsController } from "./frineds.controller";
import { AuthService } from "../auth/auth.service";

@Module({
    providers: [FriendsService, AuthService, _UserService],
    imports: [ModelsModule],
    exports: [FriendsService],
    controllers: [FriedsController]
})
export class FriendsModule {}