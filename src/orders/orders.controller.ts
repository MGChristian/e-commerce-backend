import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/create-order.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetOrderDto } from './dto/get-order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Checkout - Create order from cart' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully. Stock deducted. Cart cleared.',
    type: GetOrderDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Empty cart or insufficient stock.',
  })
  @ApiResponse({ status: 404, description: 'Cart not found.' })
  @Post('checkout')
  checkout(@Body() checkoutDto: CheckoutDto) {
    return this.ordersService.checkout(checkoutDto);
  }

  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({
    status: 200,
    description: 'List of all orders.',
    type: [GetOrderDto],
  })
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order found.',
    type: GetOrderDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @ApiOperation({ summary: 'Get orders by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Orders found for user.',
    type: [GetOrderDto],
  })
  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.ordersService.findByUserId(userId);
  }
}
