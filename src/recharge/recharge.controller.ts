import { Controller, Get, Post, Query, Headers, Body, UseInterceptors } from "@nestjs/common";
import { RechargeService } from "./recharge.service";
import { LoginInterceptor } from '../common/interceptor/login.interceptor';
import { AuthService } from "../auth/auth.service";
import { RechargeChannel } from "../typeorm/models/entities/recharge.entity";
import { getPlatform } from "../common/util/util";

@Controller('recharge')
@UseInterceptors(LoginInterceptor)
export class RechargeController {
    constructor(
        private readonly rechargeService: RechargeService,
        private readonly authService: AuthService
    ) {}

    /**
     * 充值
     */
    @Post('createOrder')
    async createOrder(
        @Headers('accesstoken') accessToken: string,
        @Headers('user-agent') userAgent,
        @Body() body,
    ) {
        const {channel, type, productId} = body;
        const platform = getPlatform(userAgent);
        const decodedToken = this.authService.decodeToken(accessToken);
        return await this.rechargeService.create(decodedToken.userId, channel, type, platform, productId)
    }

    /**
     * 更新充值状态
     */
    @Post('updateOrderState')
    async updateOrderState(
        @Headers('accesstoken') accessToken: string,
        @Body() body,
    ) {
        const { orderId, orderState,transactionIdentifier } = body;
        console.log('body===',body)
        const decodedToken = this.authService.decodeToken(accessToken);
        return await this.rechargeService.updateOrderState(orderId, orderState, transactionIdentifier)
    }

    /**
     * 校验订单状态
     * @param accessToken 
     * @param body 
     * @returns 
     */
    @Post('validatePaymentResult')
    async validatePaymentResult(
        @Headers('accesstoken') accessToken: string,
        @Body() body,
    ) {
        const {orderId, transactionReceipt, transactionIdentifier} = body;
        const decodedToken = this.authService.decodeToken(accessToken);
        return await this.rechargeService.validatePaymentResult(decodedToken.userId, orderId, transactionReceipt,transactionIdentifier)
    }

    @Get('prices')
    async getPrices() {
        return await this.rechargeService.getRechargePrices();
    }

}