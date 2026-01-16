import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CheckoutDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Repository, DataSource } from 'typeorm';
import { CartsService } from 'src/carts/carts.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private cartsService: CartsService,
    private productsService: ProductsService,
    private dataSource: DataSource,
  ) {}

  async checkout(checkoutDto: CheckoutDto): Promise<Order> {
    const { userId } = checkoutDto;

    // Get cart with items
    const cart = await this.cartsService.findByUserId(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty. Cannot checkout.');
    }

    // Use a transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate stock and calculate total price using current product prices
      let totalPrice = 0;
      const orderItems: Partial<OrderItem>[] = [];
      const stockUpdates: { productId: number; quantity: number }[] = [];

      for (const cartItem of cart.items) {
        // Get fresh product data
        const product = await this.productsService.findOne(cartItem.product.id);

        // Validate stock
        if (product.stock < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${cartItem.quantity}`,
          );
        }

        // Calculate subtotal with current price
        const subtotal = Number(product.price) * cartItem.quantity;
        totalPrice += subtotal;

        // Prepare order item with product snapshot
        orderItems.push({
          productId: product.id,
          productName: product.name,
          productPrice: Number(product.price),
          quantity: cartItem.quantity,
          subtotal: Math.round(subtotal * 100) / 100,
        });

        // Track stock to deduct
        stockUpdates.push({
          productId: product.id,
          quantity: -cartItem.quantity,
        });
      }

      // Create order
      const order = this.orderRepository.create({
        userId,
        totalPrice: Math.round(totalPrice * 100) / 100,
        items: [],
      });
      const savedOrder = await queryRunner.manager.save(order);

      // Create order items
      for (const itemData of orderItems) {
        const orderItem = this.orderItemRepository.create({
          ...itemData,
          order: savedOrder,
        });
        await queryRunner.manager.save(orderItem);
      }

      // Deduct stock from products
      for (const update of stockUpdates) {
        await queryRunner.manager
          .createQueryBuilder()
          .update('products')
          .set({ stock: () => `stock + ${update.quantity}` })
          .where('id = :id', { id: update.productId })
          .execute();
      }

      // Clear the cart
      await this.cartsService.clearCart(userId);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return the order with items
      return this.findOne(savedOrder.id);
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }
}
