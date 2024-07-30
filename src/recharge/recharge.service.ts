import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { UserService } from "../typeorm/models/services/user.service";
import { _RechargeService } from "../typeorm/models/services/recharge.service";
import { RechargeChannel, RechargeState } from "../typeorm/models/entities/recharge.entity";
import config from "../common/config/config";

// 充值类型、金额、时间
const rechargePrices = [
    {
        type: 'oneMonth',
        amount: 28,
        duration: 86400000 * 30,
        title: '一个月'
    },
    {
        type: 'threeMonth',
        amount: 80,
        duration: 86400000 * 60,
        title: '三个月'
    },
    {
        type: 'sixMonth',
        amount: 150,
        duration: 86400000 * 183,
        title: '六个月'
    },
    {
        type: 'oneYear',
        amount: 285,
        duration: 86400000 * 365,
        title: '12个月'
    }
];

@Injectable()
export class RechargeService {
    constructor(
        private readonly userService: UserService,
        private readonly _rechargeService: _RechargeService,
        private httpService: HttpService
    ) { }

    /**
     * 充值
     * @param userId 
     * @param message 
     */
    async create(
        userId: string,
        channel: RechargeChannel, 
        rechargeType: string,
        platform: string,
        productId
    ) {
        const rechargeOption = rechargePrices.find(item => {
            return rechargeType === item.type
        })
        
        if(!rechargeOption) {
            throw new HttpException("请选择正确的充值方式", HttpStatus.BAD_REQUEST);
        }

        const expirationTime = new Date(Date.now() + rechargeOption.duration);

        const opiton = {
            user_id: userId,
            recharge_channel: channel,
            recharge_platform: platform,
            recharge_amount: rechargeOption.amount,
            expiration_time: expirationTime,
            product_id: productId
        };

        const newOrder = this._rechargeService.createOrder(opiton)

        return newOrder;
    }

    /**
     * 校验付款结果
     * @param userId 
     * @param orderId 
     * @param transactionReceipt 
     * @param transactionIdentifier 
     * @returns 
     */
    async validatePaymentResult(userId, orderId, transactionReceipt,transactionIdentifier) {
        const order = this._rechargeService.getOne({
            where: {
                user_id: userId,
                order_id: orderId,
                transactionIdentifier
            }
        })

        if(!order) {
            throw new HttpException("充值失败, 请重新发起", HttpStatus.BAD_REQUEST); 
        }

        /**
         * 21000 App Store不能读取你提供的JSON对象
         * 21002 receipt-data域的数据有问题
         * 21003 receipt无法通过验证
         * 21004 提供的shared secret不匹配你账号中的shared secret
         * 21005 receipt服务器当前不可用
         * 21006 receipt合法，但是订阅已过期。服务器接收到这个状态码时，receipt数据仍然会解码并一起发送
         * 21007 receipt是Sandbox receipt，但却发送至生产系统的验证服务
         * 21008 receipt是生产receipt，但却发送至Sandbox环境的验证服务
         */
        const response = await this.httpService.post(config.verifyReceiptUrl, {
            'receipt-data': transactionReceipt
        }).toPromise()

        console.log('response===', response)

        return response.data;
    }

    /**
     * 更新订单状态
     * @param orderId 
     * @param state 
     */
    async updateOrderState(orderId: string, state: RechargeState, transactionIdentifier: string) {
        console.log('transactionIdentifier', transactionIdentifier)
        this._rechargeService.updateOrder({
            id: orderId
        }, {
            recharge_state: state,
            transactionIdentifier: transactionIdentifier || ''
        })
    }

    /**
     * 价格列表
     * @param platform 
     * @returns 
     */
    async getRechargePrices() {
        return rechargePrices;
    }
   
}