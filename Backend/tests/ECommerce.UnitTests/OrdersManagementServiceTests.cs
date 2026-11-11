using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dsw2025Tpi.Application.Dtos;
using Dsw2025Tpi.Application.Services;
using Dsw2025Tpi.Domain.Entities;
using Dsw2025Tpi.Domain.Interfaces;
using Moq;
using Xunit;

namespace ECommerce.UnitTests
{
    public class OrdersManagementServiceTests
    {
        // ==========================================
        // PARTE 3: CREACIÓN DE ÓRDENES
        // ==========================================

        // TEST 7: Creación de orden válida, cálculo contable y decremento de stock
        [Fact]
        public async Task CreateOrder_WithValidItemsAndStock_CalculatesTotalAndDecrementsProductStock()
        {
            // 1. ARRANGE
            var repoMock = new Mock<IRepository>();
            var customerId = Guid.NewGuid();

            var customer = new Customer
            {
                Id = customerId,
                IdentityUserId = customerId.ToString(),
                Name = "Juan Perez",
                Email = "juan@test.com"
            };

            var product = new Product("SKU-ORD-01", "INT-01", "Teclado Mecánico", "Desc", 1000m, 10)
            {
                IsActive = true
            };
            var productId = product.Id;

            // Simulamos la obtención de cliente y producto
            repoMock.Setup(r => r.GetById<Customer>(customerId, It.IsAny<string[]>()))
                    .ReturnsAsync(customer);

            repoMock.Setup(r => r.GetById<Product>(productId, It.IsAny<string[]>()))
                    .ReturnsAsync(product);

            repoMock.Setup(r => r.Update(It.IsAny<Product>()))
                    .ReturnsAsync((Product p) => p);

            repoMock.Setup(r => r.Add(It.IsAny<Order>()))
                    .ReturnsAsync((Order o) => o);

            var service = new OrdersManagementService(repoMock.Object);

            var items = new List<OrderItemModel.OrderItemRequest>
            {
                new OrderItemModel.OrderItemRequest(productId, 3)
            };

            var request = new OrderModel.OrderRequest(
                customerId,
                "Av. Central 123",
                "Av. Central 123",
                items
            );

            // 2. ACT
            var resultado = await service.AddOrder(request);

            // 3. ASSERT
            Assert.NotNull(resultado);
            Assert.Equal(customerId, resultado.CustomerId);
            Assert.Equal(3000m, resultado.Total);        // 3 unidades * $1000 = $3000
            Assert.Equal(999, product.StockQuantity);     // 10 iniciales - 3 compradas = 7
                         
            // Verificamos que se persista el descuento de stock y la nueva orden
            repoMock.Verify(r => r.Update(It.Is<Product>(p => p.Id == productId && p.StockQuantity == 7)), Times.Once);
            repoMock.Verify(r => r.Add(It.IsAny<Order>()), Times.Once);
        }

        // TEST 8: Stock insuficiente arroja excepción y no modifica persistencia
        [Fact]
        public async Task CreateOrder_WhenProductStockIsInsufficient_ThrowsInsufficientStockException()
        {
            // 1. ARRANGE
            var repoMock = new Mock<IRepository>();
            var customerId = Guid.NewGuid();

            var customer = new Customer
            {
                Id = customerId,
                IdentityUserId = customerId.ToString(),
                Name = "Maria Gomez",
                Email = "maria@test.com"
            };

            // Producto con stock = 2 unidades
            var product = new Product("SKU-ORD-02", "INT-02", "Monitor Gamer", "Desc", 50000m, 2)
            {
                IsActive = true
            };
            var productId = product.Id;

            repoMock.Setup(r => r.GetById<Customer>(customerId, It.IsAny<string[]>()))
                    .ReturnsAsync(customer);

            repoMock.Setup(r => r.GetById<Product>(productId, It.IsAny<string[]>()))
                    .ReturnsAsync(product);

            var service = new OrdersManagementService(repoMock.Object);

            // Solicitamos 5 unidades superando el stock disponible de 2
            var items = new List<OrderItemModel.OrderItemRequest>
            {
                new OrderItemModel.OrderItemRequest(productId, 5)
            };

            var request = new OrderModel.OrderRequest(
                customerId,
                "Calle Norte 456",
                "Calle Norte 456",
                items
            );

            // 2 y 3. ACT & ASSERT
            await Assert.ThrowsAsync<ArgumentException>(() => service.AddOrder(request));

            // No se debe descontar stock ni guardar la orden
            repoMock.Verify(r => r.Update(It.IsAny<Product>()), Times.Never);
            repoMock.Verify(r => r.Add(It.IsAny<Order>()), Times.Never);
        }

        // TEST 9: Cliente inexistente arroja excepción de inmediato sin alterar productos ni orden
        [Fact]
        public async Task CreateOrder_WhenCustomerDoesNotExist_ThrowsCustomerNotFoundException()
        {
            // 1. ARRANGE
            var repoMock = new Mock<IRepository>();
            var customerId = Guid.NewGuid();
            var productId = Guid.NewGuid();

            // Repositorio retorna null al consultar el cliente
            repoMock.Setup(r => r.GetById<Customer>(customerId, It.IsAny<string[]>()))
                    .ReturnsAsync((Customer?)null);

            var service = new OrdersManagementService(repoMock.Object);

            var items = new List<OrderItemModel.OrderItemRequest>
            {
                new OrderItemModel.OrderItemRequest(productId, 2)
            };

            var request = new OrderModel.OrderRequest(
                customerId,
                "Calle Sur 789",
                "Calle Sur 789",
                items
            );

            // 2 y 3. ACT & ASSERT
            await Assert.ThrowsAsync<ArgumentException>(() => service.AddOrder(request));

            // No debe consultar productos, ni actualizar inventario, ni registrar orden
            repoMock.Verify(r => r.GetById<Product>(It.IsAny<Guid>(), It.IsAny<string[]>()), Times.Never);
            repoMock.Verify(r => r.Update(It.IsAny<Product>()), Times.Never);
            repoMock.Verify(r => r.Add(It.IsAny<Order>()), Times.Never);
        }
    }
}