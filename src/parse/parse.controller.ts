/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { Controller, Get } from '@nestjs/common';
// import { ParseService } from './parse.service';

// @Controller()
// export class ParseController {
//   constructor(private readonly appService: ParseService) {}
//   @Get()
//   getHello(): string {
//     return this.appService.
//   }
// }

import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// import { ProductParserService } from './product-parser.service';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { ParseService } from './parse.service';
// import { MegaLaptopParserService } from './mega-laptop.service';
import { MegaLaptopParserService } from './mega-laptop.service';

@Controller('product-parser')
export class ParseController {
  constructor(
    private readonly parserService: ParseService,
    private readonly parserServices: MegaLaptopParserService,
  ) {}

  /**
   * CSV upload aur parse karne ke liye endpoint
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype === 'text/csv' ||
          file.originalname.endsWith('.csv')
        ) {
          cb(null, true);
        } else {
          cb(new Error('Only CSV files are allowed!'), false);
        }
      },
    }),
  )
  async uploadAndParse(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      console.log('📁 Processing file:', file.filename);

      // Parse CSV
      const products = await this.parserService.parseCsvToProducts(file.path);

      // Stats generate karo
      const stats = this.parserService.generateStats(products);

      // JSON file save karo
      const outputPath = path.join('./output', `products-${Date.now()}.json`);
      await this.parserService.saveToJsonFile(products, outputPath);

      return res.status(200).json({
        success: true,
        message: 'CSV successfully parsed',
        stats: stats,
        output_file: outputPath,
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error parsing CSV',
        error: error.message,
      });
    }
  }

  //   --------------------------------------------------------------------------------------------

  @Post('upload-mega-laptop')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype === 'text/csv' ||
          file.originalname.endsWith('.csv')
        ) {
          cb(null, true);
        } else {
          cb(new Error('Only CSV files are allowed!'), false);
        }
      },
    }),
  )
  async uploadAndParseMegaLaptop(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      console.log('📁 Processing file:', file.filename);

      // Parse CSV
      const products = await this.parserServices.parseCsvToProducts(file.path);

      // Stats generate karo
      const stats = this.parserServices.generateStats(products);

      // JSON file save karo
      const outputPath = path.join(
        './output',
        `products-paklap-laptops-${Date.now()}.json`,
      );
      (await this.parserServices.saveToJsonFile(
        products,
        outputPath,
      )) as unknown as any[];

      return res.status(200).json({
        success: true,
        message: 'CSV successfully parsed',
        stats: stats,
        output_file: outputPath,
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error parsing CSV',
        error: error.message,
      });
    }
  }

  /**
   * Direct file path se parse karne ke liye
   */
  @Get('parse-local')
  async parseLocalFile(@Res() res: Response) {
    try {
      const filePath = './data/products.csv'; // Your CSV file path

      const products = await this.parserService.parseCsvToProducts(filePath);
      const stats = this.parserService.generateStats(products);

      const outputPath = path.join('./output', `products-${Date.now()}.json`);
      await this.parserService.saveToJsonFile(products, outputPath);

      return res.status(200).json({
        success: true,
        stats: stats,
        output_file: outputPath,
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
