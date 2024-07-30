import { Controller, Post, Body, UseInterceptors } from "@nestjs/common";
import { LoginInterceptor } from '../common/interceptor/login.interceptor';
import { SystemService } from "./system.service";

@Controller('system')
@UseInterceptors(LoginInterceptor)
export class SystemController {
    constructor(private readonly systemService: SystemService) {}

    @Post()
    async info(@Body() body ) {
        const {  } = body;
        return await this.systemService.info();
    }
}