import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AddToCartDto } from './dto/create-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private productsService: ProductsService,
  ) {}

  // Updated to return the Calculated Totals
  async addToCart(addToCartDto: AddToCartDto) {
    const { userId, productId, quantity } = addToCartDto;

    // Validate product exists and has enough stock
    const product = await this.productsService.findOne(productId);
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${quantity}`,
      );
    }

    // Find or create cart for user
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId, items: [] });
      cart = await this.cartRepository.save(cart);
    }

    // Check if product already exists in cart
    let cartItem = cart.items.find((item) => item.product.id === productId);

    if (cartItem) {
      // Update quantity if total doesn't exceed stock
      const newQuantity = cartItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new BadRequestException(
          `Cannot add ${quantity} more. Total would exceed available stock (${product.stock}) for "${product.name}"`,
        );
      }
      cartItem.quantity = newQuantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      // Add new item to cart
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity,
      });
      await this.cartItemRepository.save(cartItem);
    }

    // CHANGED: Now returns the structure with totals
    return this.getCartWithTotals(userId);
  }

  async findByUserId(userId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart not found for user ${userId}`);
    }

    return cart;
  }

  async getCartWithTotals(userId: number) {
    const cart = await this.findByUserId(userId);

    const itemsWithSubtotals = cart.items.map((item) => ({
      id: item.id,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: Number(item.product.price), // Ensure number
        imageBase64: item.product.imageBase64,
      },
      quantity: item.quantity,
      subtotal: Number(item.product.price) * item.quantity,
    }));

    const total = itemsWithSubtotals.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    return {
      id: cart.id,
      userId: cart.userId,
      items: itemsWithSubtotals,
      total: Math.round(total * 100) / 100,
    };
  }

  // Updated to return the Calculated Totals
  async removeFromCart(userId: number, productId: number) {
    const cart = await this.findByUserId(userId);
    const cartItem = cart.items.find((item) => item.product.id === productId);

    if (!cartItem) {
      throw new NotFoundException(`Product not found in cart`);
    }

    await this.cartItemRepository.remove(cartItem);
    // CHANGED: Return consistent structure
    return this.getCartWithTotals(userId);
  }

  // Updated to return the Calculated Totals
  async updateQuantity(userId: number, productId: number, quantity: number) {
    if (quantity <= 0) {
      // Logic handles removal, then returns totals
      return this.removeFromCart(userId, productId);
    }

    const cart = await this.findByUserId(userId);
    const cartItem = cart.items.find((item) => item.product.id === productId);

    if (!cartItem) {
      throw new NotFoundException(`Product not found in cart`);
    }

    // Check stock
    const product = await this.productsService.findOne(productId);
    if (quantity > product.stock) {
      throw new BadRequestException(
        `Insufficient stock for "${product.name}". Available: ${product.stock}`,
      );
    }

    cartItem.quantity = quantity;
    await this.cartItemRepository.save(cartItem);

    // CHANGED: Now returns the structure with totals
    return this.getCartWithTotals(userId);
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items'],
    });

    if (cart && cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }
  }

  findAll() {
    return this.cartRepository.find({
      relations: ['items', 'items.product'],
    });
  }
}
