import { ApiProperty } from '@nestjs/swagger';

export class CartItemDto {
  @ApiProperty({ example: 1, description: 'Cart item ID' })
  id: number;

  @ApiProperty({
    example: { id: 1, name: 'Wireless Mouse', price: 29.99 },
    description: 'Product details',
  })
  product: {
    id: number;
    name: string;
    price: number;
  };

  @ApiProperty({ example: 2, description: 'Quantity in cart' })
  quantity: number;

  @ApiProperty({ example: 59.98, description: 'Subtotal for this item' })
  subtotal: number;
}

export class GetCartDto {
  @ApiProperty({ example: 1, description: 'Cart ID' })
  id: number;

  @ApiProperty({ example: 1, description: 'User ID' })
  userId: number;

  @ApiProperty({ type: [CartItemDto], description: 'Cart items' })
  items: CartItemDto[];

  @ApiProperty({ example: 59.98, description: 'Total cart value' })
  total: number;
}
