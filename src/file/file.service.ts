import { Injectable } from "@nestjs/common";
import { writeFile } from "fs/promises";

@Injectable()
export class FileService {
  async upload(path: string, file: Express.Multer.File) {
    return writeFile(path, file.buffer);
  }
}
