import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: 1, description: 'Order item ID' })
  id: number;

  @ApiProperty({ example: 1, description: 'Product ID' })
  productId: number;

  @ApiProperty({ example: 'Wireless Mouse', description: 'Product name at time of order' })
  productName: string;

  @ApiProperty({ example: 29.99, description: 'Product price at time of order' })
  productPrice: number;

  @ApiProperty({ example: 2, description: 'Quantity ordered' })
  quantity: number;

  @ApiProperty({ example: 59.98, description: 'Subtotal for this item' })
  subtotal: number;
}

export class GetOrderDto {
  @ApiProperty({ example: 1, description: 'Order ID' })
  id: number;

  @ApiProperty({ example: 1, description: 'User ID' })
  userId: number;

  @ApiProperty({ example: 59.98, description: 'Total order price' })
  totalPrice: number;

  @ApiProperty({ type: [OrderItemDto], description: 'Order items' })
  items: OrderItemDto[];

  @ApiProperty({ example: '2024-01-01T12:00:00Z', description: 'Order creation date' })
  createdAt: Date;
}
