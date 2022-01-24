import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    MulterModule.register({
      dest: `./${process.env.IMGAPI_UPLOAD_FOLDER}/tmp`,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
