import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";

import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdatePutUserDTO } from "./dto/update-put-user.dto";
import { UpdatePatchUserDTO } from "./dto/update-patch-user.dto";
import { Repository } from "typeorm";
import { User } from "./entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  async create(data: CreateUserDTO) {
    if (
      await this.usersRepository.exist({
        where: {
          email: data.email,
        },
      })
    ) {
      throw new BadRequestException("This email already exists!");
    }

    data.password = await bcrypt.hash(data.password, await bcrypt.genSalt());

    const user = this.usersRepository.create(data);

    return await this.usersRepository.save(user);
  }

  async list() {
    return this.usersRepository.find();
  }

  async listUser(id: number) {
    await this.exists(id);
    return this.usersRepository.findOneBy({ id });
  }

  async update(
    id: number,
    { email, name, password, birthAt, role }: UpdatePutUserDTO,
  ) {
    await this.exists(id);

    password = await bcrypt.hash(password, await bcrypt.genSalt());

    await this.usersRepository.update(id, {
      email,
      name,
      password,
      birthAt: birthAt ? new Date(birthAt) : null,
      role,
    });

    return this.listUser(id);
  }

  async partialUpdate(
    id: number,
    { email, name, password, birthAt, role }: UpdatePatchUserDTO,
  ) {
    await this.exists(id);

    const data: any = {};

    if (birthAt) {
      data.birthAt = new Date(birthAt);
    }

    if (password) {
      data.password = await bcrypt.hash(password, await bcrypt.genSalt());
    }

    if (name) {
      data.name = name;
    }

    if (email) {
      data.email = email;
    }

    if (role) {
      data.role = role;
    }

    await this.usersRepository.update(id, data);

    return this.listUser(id);
  }

  async delete(id: number) {
    await this.exists(id);

    return this.usersRepository.delete(id);
  }

  async exists(id: number) {
    if (
      !(await this.usersRepository.exist({
        where: {
          id,
        },
      }))
    ) {
      throw new NotFoundException(`The user with id ${id} does not exists!`);
    }
  }
}
