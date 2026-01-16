import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Wireless Mouse',
    description: 'The name of the product',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'A high-quality wireless mouse with ergonomic design',
    description: 'The description of the product',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 29.99,
    description: 'The price of the product',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiProperty({
    example: 100,
    description: 'The stock quantity of the product',
  })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    example: 'Base64EncodedStringHere',
    description: 'Base64 encoded image of the product',
  })
  @IsString()
  @IsNotEmpty()
  imageBase64: string;
}
