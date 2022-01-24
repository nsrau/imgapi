import { AppService } from './app.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { UserDto } from './user.dto';
import { imageFileFilter } from './utils';

const upload = path.join(__dirname, '../', process.env.IMGAPI_UPLOAD_FOLDER);

@Controller()
export class AppController {
  constructor() { }

  @Get('file/:userkey/:filename')
  async getFile(@Param() params, @Res() res: Response) {
    try {
      const file = `${upload}/${params.userkey}/${params.filename}`;
      if (fs.existsSync(file)) {
        res.sendFile(`${upload}/${params.userkey}/${params.filename}`);
      } else {
        res.sendStatus(404);
      }
    } catch (e) {
      res.sendStatus(404);
    }
  }

  @Delete('file/:userkey/:filename')
  async deleteFile(@Param() params, @Res() res: Response) {
    try {
      const file = `${upload}/${params.userkey}/${params.filename}`;
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        res.sendStatus(204);
      } else {
        res.sendStatus(404);
      }
    } catch (e) {
      res.sendStatus(404);
    }
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: imageFileFilter,
      storage: diskStorage({
        destination: `./${process.env.IMGAPI_UPLOAD_FOLDER}/tmp`,
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${path.extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 1000000 },
    }),
  )
  async uploadFile(
    @Body() user: UserDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const error: any[] = [];

    if (!image) {
      error.push('image is undefined');
      return { error };
    }

    if (!Object.keys(user).length) {
      error.push('user is undefined');
      fs.unlinkSync(`${upload}/tmp/${image.filename}`);
      return { error };
    }

    const tmpImgPath = `${image.path}`;
    let userPath = '';
    let userImgPath = undefined;
    let userkey = undefined;

    try {
      userkey = AppService.encrypt(user.name);
      if (AppService.decrypt(userkey) === user.name) {
        userPath = `${process.env.IMGAPI_UPLOAD_FOLDER}/${userkey}`;
        userImgPath = `${userPath}/${image.filename}`;
      }
    } catch (e) {
      error.push(e);
    }

    try {
      await fs.promises.access(userPath, fs.constants.F_OK);
    } catch (e) {
      await fs.promises.mkdir(userPath, { recursive: true });
    }

    try {
      await fs.promises.rename(tmpImgPath, userImgPath);
    } catch (e) {
      error.push(e);
    }

    const { originalname, mimetype, size, filename } = image;

    return {
      error,
      url: userImgPath.replace(`${process.env.IMGAPI_UPLOAD_FOLDER}/`, ''),
      userKey: userkey,
      img: {
        originalname,
        mimetype,
        size,
        filename,
      },
    };
  }
}
