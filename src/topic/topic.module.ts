import { Module } from "@nestjs/common";
import { TopicService } from "./topic.service";
import { ModelsModule } from "../typeorm/models/models.module";
import { TopicController } from "./topic.controller";
import { AuthService } from "../auth/auth.service";

@Module({
    providers: [TopicService, AuthService],
    exports: [],
    imports: [ModelsModule],
    controllers: [TopicController]
})
export class TopicModule {}