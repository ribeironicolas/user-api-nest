import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdatePutUserDTO } from "./dto/update-put-user.dto";
import { UpdatePatchUserDTO } from "./dto/update-patch-user.dto";
import { UserService } from "./user.service";
import { LogInterceptor } from "src/interceptors/log.interceptor";
import { ParamId } from "src/decorators/param-id.decorator";
import { Roles } from "src/decorators/roles.decorator";
import { Role } from "src/enums/role.enum";
import { RoleGuard } from "src/guards/role.guard";
import { AuthGuard } from "src/guards/auth.guard";

@Roles(Role.Admin)
@UseGuards(AuthGuard, RoleGuard)
@UseInterceptors(LogInterceptor)
@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async create(@Body() data: CreateUserDTO) {
    return this.userService.create(data);
  }

  @Get()
  async listUsers() {
    return this.userService.list();
  }

  @Get(":id")
  async listUser(@ParamId() id: number) {
    return this.userService.listUser(id);
  }

  @Patch(":id")
  async partialUpdate(@Body() data: UpdatePatchUserDTO, @ParamId() id: number) {
    return this.userService.partialUpdate(id, data);
  }

  @Put(":id")
  async update(@Body() data: UpdatePutUserDTO, @ParamId() id: number) {
    return this.userService.update(id, data);
  }

  @Delete(":id")
  async delete(@ParamId() id: number) {
    return this.userService.delete(id);
  }
}
