import { Module } from '@nestjs/common';
import { ParseController } from './parse.controller';
import { ParseService } from './parse.service';
import { MegaLaptopParserService } from './mega-laptop.service';

@Module({
  imports: [],
  controllers: [ParseController],
  providers: [ParseService, MegaLaptopParserService],
})
export class ParseModule {}
