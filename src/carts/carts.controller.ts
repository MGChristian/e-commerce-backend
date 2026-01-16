import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddToCartDto } from './dto/create-cart.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetCartDto } from './dto/get-cart.dto';

@ApiTags('Carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @ApiOperation({ summary: 'Add a product to cart' })
  @ApiResponse({
    status: 201,
    description: 'Product added to cart successfully.',
    type: GetCartDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Insufficient stock.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @Post('add')
  addToCart(@Body() addToCartDto: AddToCartDto) {
    return this.cartsService.addToCart(addToCartDto);
  }

  @ApiOperation({ summary: 'Get cart by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully.',
    type: GetCartDto,
  })
  @ApiResponse({ status: 404, description: 'Cart not found.' })
  @Get('user/:userId')
  getCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartsService.getCartWithTotals(userId);
  }

  @ApiOperation({ summary: 'Update item quantity in cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart updated successfully.',
    type: GetCartDto,
  })
  @ApiResponse({ status: 404, description: 'Cart or product not found.' })
  @Patch('user/:userId/product/:productId')
  updateQuantity(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Query('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.cartsService.updateQuantity(userId, productId, quantity);
  }

  @ApiOperation({ summary: 'Remove a product from cart' })
  @ApiResponse({
    status: 200,
    description: 'Product removed from cart.',
    type: GetCartDto,
  })
  @ApiResponse({ status: 404, description: 'Cart or product not found.' })
  @Delete('user/:userId/product/:productId')
  removeFromCart(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.cartsService.removeFromCart(userId, productId);
  }

  @ApiOperation({ summary: 'Get all carts (admin)' })
  @ApiResponse({
    status: 200,
    description: 'List of all carts.',
  })
  @Get()
  findAll() {
    return this.cartsService.findAll();
  }
}
