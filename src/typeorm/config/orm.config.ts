import {ConnectionOptions} from "typeorm";
import config from "../../common/config/config";

import {User} from "../models/entities/user.entity";
import {Group} from "../models/entities/_group.entity";
import {Socket} from "../models/entities/socket.entity";
import { Expression } from "../models/entities/expression.entity";
import {Theme} from "../models/entities/theme.entity";
import {ThemeType} from "../models/entities/theme_type.entity";
import {Tone} from "../models/entities/tone.entity";
import {Message} from "../models/entities/message.entity";
import {PreferSetting} from "../models/entities/prefer_setting.entity";
import {Friendship} from "../models/entities/friendship.entity";
import {GroupRelationship} from "../models/entities/group_relationship.entity";
import {ExpressionCollection} from "../models/entities/expression_collection.entity";
import {RandomAvatars} from "../models/entities/random_avatars.entity";
import {Info} from "../models/entities/info.entity";
import {Dialog} from "../models/entities/dialog.entity";
import { Topic } from "../models/entities/topic.entity";
import { Complaint } from "../models/entities/complaint.entity";
import { Recharge } from "../models/entities/recharge.entity";

export const ormConfig: ConnectionOptions = {
    type: "mysql",
    host: config.mysql.host,
    port: config.mysql.port,
    username: config.mysql.username,
    password: config.mysql.password,
    database: config.mysql.database,
    entities: [
        User,
        Group,
        Socket,
        Expression,
        Theme,
        ThemeType,
        Tone,
        Message,
        PreferSetting,
        Friendship,
        GroupRelationship,
        ExpressionCollection,
        RandomAvatars,
        Info,
        Dialog,
        Topic,
        Recharge,
        Complaint
    ],
    synchronize: true
}
