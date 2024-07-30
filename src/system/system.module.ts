import { Module } from "@nestjs/common";

import { SystemController } from "./system.controller";
import { SystemService } from "./system.service";
import {ModelsModule} from "../typeorm/models/models.module";

@Module({
    controllers: [SystemController],
    providers: [ SystemService ],
    imports: [ModelsModule]
})
export class SystemModule {}