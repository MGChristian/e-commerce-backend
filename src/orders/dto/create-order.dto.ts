import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the user checking out',
  })
  @IsInt()
  @IsPositive()
  userId: number;
}

export class CreateOrderDto extends CheckoutDto {}
