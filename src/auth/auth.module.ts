import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthController } from "./auth.controller";
import { UserModule } from "src/user/user.module";
import { AuthService } from "./auth.service";
import { FileModule } from "src/file/file.module";
import { User } from "src/user/entity/user.entity";

@Module({
  imports: [
    JwtModule.register({
      secret: String(process.env.JWT_SECRET),
    }),
    forwardRef(() => UserModule),
    FileModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, TypeOrmModule],
  exports: [AuthService],
})
export class AuthModule {}
