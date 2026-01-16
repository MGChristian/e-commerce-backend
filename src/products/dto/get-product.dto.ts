import { ApiProperty } from '@nestjs/swagger';

export class GetProductDto {
  @ApiProperty({ example: 1, description: 'The ID of the product' })
  id: number;

  @ApiProperty({
    example: 'Wireless Mouse',
    description: 'The name of the product',
  })
  name: string;

  @ApiProperty({
    example: 'A high-quality wireless mouse',
    description: 'The description of the product',
  })
  description: string;

  @ApiProperty({ example: 29.99, description: 'The price of the product' })
  price: number;

  @ApiProperty({ example: 100, description: 'The stock quantity' })
  stock: number;

  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: 'Base64EncodedStringHere',
    description: 'Base64 encoded image of the product',
  })
  imageBase64: string;
}
