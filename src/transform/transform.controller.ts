/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductTransformService } from './transform.service';

@Controller('api')
export class ProductTransformController {
  constructor(private readonly transformService: ProductTransformService) {}

  /**
   * Endpoint: POST /api/products/upload-and-transform
   * Description: Upload un-structured JSON file aur transform karke structured output return karo
   *
   * Postman se use kaise karein:
   * 1. Method: POST
   * 2. URL: http://localhost:3000/api/products/upload-and-transform
   * 3. Body: form-data
   * 4. Key: file (type: File)
   * 5. Value: Apni JSON file select karo
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temp', // Temporary upload folder
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `product-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Sirf JSON files allow karo
        if (
          file.mimetype !== 'application/json' &&
          !file.originalname.endsWith('.json')
        ) {
          return callback(
            new BadRequestException('Sirf JSON files upload kar sakte hain!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
    }),
  )
  async uploadAndTransform(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('File upload nahi hui!');
    }

    try {
      // File ko transform karo
      const result = await this.transformService.transformProductData(
        file.path,
      );

      // Response bhejo
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Data successfully transform',
        data: {
          totalProducts: result.totalProducts,
          outputFilePath: result.outputFilePath,
          productGroups: result.productGroups,
        },
      });
    } catch (error) {
      throw new BadRequestException(`Transformation failed: ${error.message}`);
    }
  }

  /**
   * Endpoint: POST /api/products/transform-json
   * Description: Direct JSON body bhejo aur transform karo (file upload ke bina)
   *
   * Postman se use:
   * 1. Method: POST
   * 2. URL: http://localhost:3000/api/products/transform-json
   * 3. Body: raw (JSON)
   * 4. Apna JSON data paste karo
   */
  @Post('transform-json')
  async transformFromJson(@Res() res: Response) {
    try {
      const result = await this.transformService.transformFromRequest();

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Data successfully transformed!',
        data: result,
      });
    } catch (error) {
      throw new BadRequestException(`Transformation failed: ${error.message}`);
    }
  }
}
