import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from "@nestjs/platform-express";

import { AuthLoginDTO } from "./dto/auth-login.dto";
import { AuthRegisterDTO } from "./dto/auth-register.dto";
import { AuthForgetDTO } from "./dto/auth-forget.dto";
import { AuthResetDTO } from "./dto/auth-reset.dto";
import { AuthService } from "./auth.service";
import { AuthGuard } from "src/guards/auth.guard";
import { User } from "src/decorators/user.decorator";
import { join } from "path";
import { FileService } from "src/file/file.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly fileService: FileService,
  ) {}

  @Post("login")
  async login(@Body() body: AuthLoginDTO) {
    return this.authService.login(body.email, body.password);
  }

  @Post("register")
  async register(@Body() body: AuthRegisterDTO) {
    return this.authService.register(body);
  }

  @Post("forget")
  async forget(@Body() body: AuthForgetDTO) {
    return this.authService.forget(body.email);
  }

  @Post("reset")
  async reset(@Body() body: AuthResetDTO) {
    return this.authService.reset(body.password, body.token);
  }

  @UseGuards(AuthGuard)
  @Post("me")
  async me(@User("email") user) {
    return { user };
  }

  @UseInterceptors(FileInterceptor("file"))
  @UseGuards(AuthGuard)
  @Post("photo")
  async uploadPhoto(
    @User() user,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: "image/*" }),
          new MaxFileSizeValidator({ maxSize: 1024 * 20 }),
        ],
      }),
    )
    photo: Express.Multer.File,
  ) {
    const path = join(
      __dirname,
      "..",
      "..",
      "storage",
      "photos",
      `photo-${user.id}.png`,
    );

    try {
      await this.fileService.upload(path, photo);
    } catch (error) {
      throw new BadRequestException(error);
    }

    return { success: true };
  }

  @UseInterceptors(FilesInterceptor("files"))
  @UseGuards(AuthGuard)
  @Post("files")
  async uploadFiles(
    @User() user,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return files;
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: "photo",
        maxCount: 1,
      },
      { name: "documents", maxCount: 5 },
    ]),
  )
  @UseGuards(AuthGuard)
  @Post("files-fields")
  async uploadFilesFields(
    @User() user,
    @UploadedFiles()
    files: { photo: Express.Multer.File; documents: Express.Multer.File[] },
  ) {
    return { files };
  }
}
