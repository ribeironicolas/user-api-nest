import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDTO } from "src/user/dto/create-user.dto";
import { UserService } from "src/user/user.service";
import * as bcrypt from "bcrypt";
import { MailerService } from "@nestjs-modules/mailer";
import { User } from "src/user/entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
  constructor(
    private JWTService: JwtService,
    private readonly userService: UserService,
    private readonly mailer: MailerService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  createToken(user: User) {
    return {
      accessToken: this.JWTService.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        {
          expiresIn: "7 days",
          subject: user.id.toString(),
          issuer: "login",
          audience: "users",
        },
      ),
    };
  }

  checkToken(token: string) {
    try {
      const data = this.JWTService.verify(token, {
        audience: "users",
        issuer: "login",
      });

      return data;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  isValidToken(token: string) {
    try {
      this.checkToken(token);
      return true;
    } catch (error) {
      return false;
    }
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException("Incorrect email or password");
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException("Incorrect email or password");
    }

    return this.createToken(user);
  }

  async forget(email: string) {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new UnauthorizedException("Incorrect email");
    }

    const token = this.JWTService.sign(
      {
        id: user.id,
      },
      {
        expiresIn: "30 minutes",
        subject: String(user.id),
        issuer: "forget",
        audience: "users",
      },
    );

    await this.mailer.sendMail({
      subject: "Password Recovery",
      to: "nicolasribeiro.contato@gmail.com",
      template: "forget",
      context: {
        name: user.name,
        token,
      },
    });
    return { token };
  }

  async reset(password: string, token: string) {
    try {
      const data: any = this.JWTService.verify(token, {
        issuer: "forget",
        audience: "users",
      });

      if (isNaN(Number(data.id))) {
        throw new BadRequestException("Invalid token");
      }

      password = await bcrypt.hash(password, await bcrypt.genSalt());

      await this.usersRepository.update(Number(data.id), {
        password,
      });

      const user = await this.userService.listUser(Number(data.id));

      return this.createToken(user);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async register(data: CreateUserDTO) {
    const user = await this.userService.create(data);

    return this.createToken(user);
  }
}
