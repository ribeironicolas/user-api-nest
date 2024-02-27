import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  forwardRef,
} from "@nestjs/common";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { MailerModule } from "@nestjs-modules/mailer";
import { PugAdapter } from "@nestjs-modules/mailer/dist/adapters/pug.adapter";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { UserIdCheckMiddleware } from "./middlewares/user-id-check.middleware";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user/entity/user.entity";

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    MailerModule.forRoot({
      transport: {
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: "olen.haag19@ethereal.email",
          pass: "FKwDC2C3qN4zjCtMVE",
        },
      },
      defaults: {
        from: '"Hello" <olen.haag19@ethereal.email>',
      },
      template: {
        dir: __dirname + "/templates",
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User],
      synchronize: process.env.ENV === "development",
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserIdCheckMiddleware).forRoutes({
      path: "users/:id",
      method: RequestMethod.ALL,
    });
  }
}
