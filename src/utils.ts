// Allow only images
import { HttpException, HttpStatus } from '@nestjs/common';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(
      new HttpException(
        'Only image files are allowed!',
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
  }
  callback(null, true);
};
