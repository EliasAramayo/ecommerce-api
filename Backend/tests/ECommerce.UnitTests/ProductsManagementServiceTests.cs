using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Dsw2025Tpi.Application.Dtos;
using Dsw2025Tpi.Application.Services;
using Dsw2025Tpi.Domain.Entities;
using Dsw2025Tpi.Domain.Interfaces;
using Moq;
using Xunit;

namespace ECommerce.UnitTests
{
    public class ProductsManagementServiceTests
    {
        // ==========================================
        // PARTE 1: CREACIÓN DE PRODUCTOS
        // ==========================================

        // TEST 1: Camino feliz de creación de producto
        [Fact]
        public async Task AddProduct_WithValidData_ReturnsProductAndCallsRepositoryAdd()
        {
            // 1. ARRANGE
            var repoMock = new Mock<IRepository>();

            repoMock.Setup(r => r.First<Product>(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<string[]>()))
                    .ReturnsAsync((Product?)null);

            repoMock.Setup(r => r.Add(It.IsAny<Product>()))
                    .ReturnsAsync((Product p) => p);

            var service = new ProductsManagementService(repoMock.Object);

            var request = new ProductModel.ProductRequest(
                "SKU-TEST-001",
                "INT-001",
                "Mouse Inalámbrico",
                "Mouse óptico de prueba",
                2500m,
                15
            );

            // 2. ACT
            var resultado = await service.AddProduct(request);

            // 3. ASSERT
            Assert.NotNull(resultado);
            Assert.Equal("SKU-TEST-001", resultado.Sku);
            Assert.Equal("Mouse Inalámbrico", resultado.Name);
            Assert.True(resultado.IsActive);

            repoMock.Verify(r => r.Add(It.IsAny<Product>()), Times.Once);
        }

        // TEST 2: Validación de SKU duplicado
        [Fact]
        public async Task AddProduct_WithDuplicateSku_ThrowsDuplicatedEntityException()
        {
            // 1. ARRANGE
            var repoMock = new Mock<IRepository>();

            var productoExistente = new Product(
                "SKU-DUPLICADO",
                "INT-EXIST",
                "Teclado Existente",
                "Descripción",
                1200m,
                5
            );

            repoMock.Setup(r => r.First<Product>(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<string[]>()))
                    .ReturnsAsync(productoExistente);

            var service = new ProductsManagementService(repoMock.Object);

            var request = new ProductModel.ProductRequest(
                "SKU-DUPLICADO",
                "INT-002",
                "Teclado Nuevo",
                "Descripción nuevo",
                1500m,
                10
            );

            // 2 y 3. ACT & ASSERT
            await Assert.ThrowsAsync<ArgumentException>(() => service.AddProduct(request));

            repoMock.Verify(r => r.Add(It.IsAny<Product>()), Times.Never);
        }

        // TEST 3: Validación de parámetros numéricos inválidos (Precio <= 0 o Stock < 0)
        [Theory]
        [InlineData(0, 10)]      // Precio en 0
        [InlineData(-50, 10)]    // Precio negativo
        [InlineData(150, -1)]    // Stock negativo
        public async Task AddProduct_WithInvalidStockOrPrice_ThrowsInvalidDataException(decimal precioInvalido, int stockInvalido)
        {
            // 1. ARRANGE
            var repoMock = new Mock<IRepository>();
            var service = new ProductsManagementService(repoMock.Object);

            var request = new ProductModel.ProductRequest(
                "SKU-VALIDO",
                "INT-003",
                "Producto Prueba",
                "Descripción",
                precioInvalido,
                stockInvalido
            );

            // 2 y 3. ACT & ASSERT
            await Assert.ThrowsAsync<ArgumentException>(() => service.AddProduct(request));

            repoMock.Verify(r => r.First<Product>(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<string[]>()), Times.Never);
            repoMock.Verify(r => r.Add(It.IsAny<Product>()), Times.Never);
        }

        // ==========================================
        // PARTE 2: LISTADO DE PRODUCTOS
        // ==========================================

        // TEST 4: Filtrado de catálogo público (excluye inactivos)
        [Fact]
        public async Task GetProducts_WhenIncludeInactiveIsFalse_ReturnsOnlyActiveProducts()
        {
            // 1. ARRANGE
            var repoMock = new Mock<IRepository>();

            var productoActivo1 = new Product("SKU-ACT-01", "INT-01", "Monitor 24", "Desc", 120000m, 10) { IsActive = true };
            var productoInactivo = new Product("SKU-INA-01", "INT-02", "Mouse Roto", "Desc", 5000m, 0) { IsActive = false };
            var productoActivo2 = new Product("SKU-ACT-02", "INT-03", "Teclado RGB", "Desc", 35000m, 8) { IsActive = true };

            var listaFiltradaBase = new List<Product> { productoActivo1, productoActivo2 };

            repoMock.Setup(r => r.GetFiltered<Product>(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<string[]>()))
                    .ReturnsAsync(listaFiltradaBase);

            var service = new ProductsManagementService(repoMock.Object);
            var filter = new ProductModel.FilterProduct("enabled", null, 1, 10);

            // 2. ACT
            var resultado = await service.GetProducts(filter);

            // 3. ASSERT
            Assert.NotNull(resultado);
            Assert.Equal(2, resultado.TotalCount);
            Assert.All(resultado.Items, item => Assert.True(item.IsActive));
            repoMock.Verify(r => r.GetFiltered<Product>(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<string[]>()), Times.Once);
        }

        // TEST 5: Paginación matemática correcta (Skip y Take)
        [Fact]
        public async Task GetProducts_WithPaginationFilter_AppliesSkipAndTakeCorrectly()
        {
            // 1. ARRANGE
            var repoMock = new Mock<IRepository>();

            var quinceProductos = new List<Product>();
            for (int i = 1; i <= 15; i++)
            {
                quinceProductos.Add(new Product(
                    $"SKU-{i:D2}",
                    $"INT-{i:D2}",
                    $"Producto {i}",
                    "Descripción",
                    100m * i,
                    5
                )
                { IsActive = true });
            }

            repoMock.Setup(r => r.GetFiltered<Product>(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<string[]>()))
                    .ReturnsAsync(quinceProductos);

            var service = new ProductsManagementService(repoMock.Object);
            var filter = new ProductModel.FilterProduct("all", null, 2, 5);

            // 2. ACT
            var resultado = await service.GetProducts(filter);

            // 3. ASSERT
            Assert.NotNull(resultado);
            Assert.Equal(15, resultado.TotalCount);
            Assert.Equal(5, resultado.Items.Count);
            Assert.Equal(2, resultado.PageNumber);
            Assert.Equal(5, resultado.PageSize);
            Assert.Equal(3, resultado.TotalPages);
            Assert.Equal("SKU-06", resultado.Items[0].Sku);
            Assert.Equal("SKU-10", resultado.Items[4].Sku);
        }

        // TEST 6: Búsqueda por coincidencia parcial (SearchTerm)
        [Fact]
        public async Task GetProducts_WithSearchTerm_FiltersByNameSkuOrInternalCode()
        {
            // 1. ARRANGE
            var repoMock = new Mock<IRepository>();

            var p1 = new Product("SKU-MOU", "INT-01", "Mouse Gamer", "Desc", 15000m, 10) { IsActive = true };
            var p2 = new Product("SKU-TEC", "INT-02", "Teclado Mecánico", "Desc", 45000m, 5) { IsActive = true };
            var p3 = new Product("SKU-MON", "INT-03", "Monitor 144Hz", "Desc", 210000m, 3) { IsActive = true };

            repoMock.Setup(r => r.GetFiltered<Product>(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<string[]>()))
                    .ReturnsAsync(new List<Product> { p1 });

            var service = new ProductsManagementService(repoMock.Object);
            var filter = new ProductModel.FilterProduct("all", "mouse", 1, 10);

            // 2. ACT
            var resultado = await service.GetProducts(filter);

            // 3. ASSERT
            Assert.NotNull(resultado);
            Assert.Single(resultado.Items);
            Assert.Equal("Mouse Gamer", resultado.Items[0].Name);
            repoMock.Verify(r => r.GetFiltered<Product>(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<string[]>()), Times.Once);
        }
    }
}