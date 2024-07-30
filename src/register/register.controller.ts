import { Controller, Post, Body } from "@nestjs/common";

import {RegisterService} from "./register.service";


@Controller('register')
export class RegisterController {
    constructor(private readonly registerService: RegisterService) {}

    @Post()
    async register(@Body() body ) {
        const { userName, password, deviceId,nickName, gender } = body;
        console.log('body===', body)
        return await this.registerService.register(userName,password,deviceId,nickName,gender);
    }
}