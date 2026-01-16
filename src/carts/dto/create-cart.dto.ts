import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the user',
  })
  @IsInt()
  @IsPositive()
  userId: number;

  @ApiProperty({
    example: 1,
    description: 'The ID of the product to add to cart',
  })
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({
    example: 2,
    description: 'The quantity to add',
  })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateCartDto extends AddToCartDto {}
