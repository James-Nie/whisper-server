import { Module } from "@nestjs/common";
import { _DialogService } from "./dialog.service";
import { ModelsModule } from "../typeorm/models/models.module";
import { DialogController } from "./dialog.controller";
import { AuthService } from "../auth/auth.service";

@Module({
    providers: [_DialogService, AuthService],
    exports: [_DialogService],
    imports: [ModelsModule],
    controllers: [DialogController]
})
export class DialogModule {}