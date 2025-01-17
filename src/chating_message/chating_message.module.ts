import { Module } from "@nestjs/common";

import { ChatingMessageService } from "./chating_message.service";
import {ModelsModule} from "../typeorm/models/models.module";
import { DialogModule } from "../dialog/dialog.module";
import { GroupModule } from "../group/group.module";
import { ChatingMessageController } from "./chating_message.controller";
import { AuthService } from "../auth/auth.service";

@Module({
    providers: [ChatingMessageService, AuthService],
    exports: [ChatingMessageService],
    imports: [ModelsModule,DialogModule,GroupModule],
    controllers: [ChatingMessageController]
})
export class ChatingMessageModule {}