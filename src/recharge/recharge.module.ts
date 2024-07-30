import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { RechargeService } from "./recharge.service";
import { ModelsModule } from "../typeorm/models/models.module";
import { RechargeController } from "./recharge.controller";
import { AuthService } from "../auth/auth.service";

@Module({
    providers: [RechargeService, AuthService],
    exports: [],
    imports: [ModelsModule, HttpModule],
    controllers: [RechargeController]
})
export class RechargeModule {}