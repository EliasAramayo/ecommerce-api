using System.Net;
using System.Net.Http.Json;
using Dsw2025Tpi.Application.Dtos;
using Dsw2025Tpi.Data;
using Dsw2025Tpi.Domain.Entities;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Headers;
using Dsw2025Tpi.Application.Services;

namespace ECommerce.IntegrationTests;

public class ProductsIntegrationTests
{
    [Fact]
    public async Task GetProducts_PublicEndpoint_ReturnsOkWithPaginatedJsonStructure()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var product = new Product("PI07-MOUSE", "PI07", "Mouse Gamer", "Mouse de prueba", 150m, 10);
        using (var scope = factory.Services.CreateScope())
        {
            var database = scope.ServiceProvider.GetRequiredService<Dsw2025TpiContext>();
            database.Set<Product>().Add(product);
            await database.SaveChangesAsync();
        }

        using var response = await client.GetAsync("/api/products");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var page = Assert.IsType<ProductModel.ResponsePagination>(
            await response.Content.ReadFromJsonAsync<ProductModel.ResponsePagination>());
        Assert.Equal(1, page.TotalCount);
        var item = Assert.Single(page.Items);
        Assert.Equal(product.Id, item.Id);
        Assert.Equal(product.Sku, item.Sku);
    }

        [Fact]
    public async Task GetProducts_WithQueryStringFilters_ReturnsFilteredResultsFromSqlite()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var mouse = new Product("PI08-01", "P01", "Mouse Gamer", "Producto de prueba", 150m, 10);
        var teclado = new Product("PI08-02", "P02", "Teclado Mecánico", "Producto de prueba", 200m, 10);
        var monitor = new Product("PI08-03", "P03", "Monitor", "Producto de prueba", 300m, 10);

        using (var scope = factory.Services.CreateScope())
        {
            var database = scope.ServiceProvider.GetRequiredService<Dsw2025TpiContext>();
            database.Set<Product>().AddRange(mouse, teclado, monitor);
            await database.SaveChangesAsync();
        }

        using var response = await client.GetAsync(
            "/api/products?search=Mouse&pageNumber=1&pageSize=10");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var page = Assert.IsType<ProductModel.ResponsePagination>(
            await response.Content.ReadFromJsonAsync<ProductModel.ResponsePagination>());

        Assert.Equal(1, page.TotalCount);
        Assert.Equal(1, page.PageNumber);
        Assert.Equal(10, page.PageSize);

        var item = Assert.Single(page.Items);
        Assert.Equal(mouse.Id, item.Id);
    }

        [Fact]
    public async Task GetAuthProducts_AdminEndpoint_WhenCalledByAdmin_IncludesInactiveProducts()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var product = new Product(
            "PI09-01", "P09", "Monitor discontinuado", "Producto de prueba", 300m, 10)
        {
            IsActive = false
        };

        using (var scope = factory.Services.CreateScope())
        {
            var database = scope.ServiceProvider.GetRequiredService<Dsw2025TpiContext>();
            database.Set<Product>().Add(product);
            await database.SaveChangesAsync();

            var tokenService = scope.ServiceProvider.GetRequiredService<JwtTokenService>();
            var token = tokenService.GenerateToken("admin", "ADMIN");
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);
        }

        using var response = await client.GetAsync("/api/products/admin");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var page = Assert.IsType<ProductModel.ResponsePagination>(
            await response.Content.ReadFromJsonAsync<ProductModel.ResponsePagination>());

        var item = Assert.Single(page.Items);
        Assert.Equal(product.Id, item.Id);
        Assert.False(item.IsActive);
    }

        [Fact]
    public async Task AddProduct_WhenUnauthenticated_ReturnsUnauthorized()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var product = new ProductModel.ProductRequest(
            "PI01-01", "P01", "Mouse de prueba", "Producto de integración", 150m, 10);

        using var response = await client.PostAsJsonAsync("/api/products", product);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

        [Fact]
    public async Task AddProduct_WhenAuthenticatedAsAdmin_PersistsInSqliteAndReturnsCreated()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        using var scope = factory.Services.CreateScope();
        var tokenService = scope.ServiceProvider.GetRequiredService<JwtTokenService>();
        var token = tokenService.GenerateToken("admin", "ADMIN");
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var request = new ProductModel.ProductRequest(
            "PI02-01", "P02", "Mouse Gamer", "Producto de prueba", 150m, 10);

        using var response = await client.PostAsJsonAsync("/api/products", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var database = scope.ServiceProvider.GetRequiredService<Dsw2025TpiContext>();
        var savedProduct = Assert.Single(
            database.Set<Product>().Where(product => product.Sku == request.Sku));

        Assert.Equal(request.InternalCode, savedProduct.InternalCode);
        Assert.Equal(request.Name, savedProduct.Name);
        Assert.Equal(request.Description, savedProduct.Description);
        Assert.Equal(request.CurrentUnitPrice, savedProduct.CurrentUnitPrice);
        Assert.Equal(request.StockQuantity, savedProduct.StockQuantity);
    }

        [Fact]
    public async Task AddProduct_WhenSkuAlreadyExists_ReturnsBadRequest()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        const string sku = "PI03-01";
        var original = new Product(
            sku, "P03", "Mouse original", "Producto de prueba", 150m, 10);

        using (var scope = factory.Services.CreateScope())
        {
            var database = scope.ServiceProvider.GetRequiredService<Dsw2025TpiContext>();
            database.Set<Product>().Add(original);
            await database.SaveChangesAsync();

            var tokenService = scope.ServiceProvider.GetRequiredService<JwtTokenService>();
            var token = tokenService.GenerateToken("admin", "ADMIN");
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);
        }

        var request = new ProductModel.ProductRequest(
            sku, "P03-NUEVO", "Otro mouse", "Intento de duplicado", 200m, 5);

        using var response = await client.PostAsJsonAsync("/api/products", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("Ya existe un producto con el Sku", await response.Content.ReadAsStringAsync());

        using var verificationScope = factory.Services.CreateScope();
        var verificationDatabase =
            verificationScope.ServiceProvider.GetRequiredService<Dsw2025TpiContext>();

        var savedProduct = Assert.Single(
            verificationDatabase.Set<Product>().Where(product => product.Sku == sku));
        Assert.Equal(original.Id, savedProduct.Id);
        Assert.Equal(original.Name, savedProduct.Name);
    }
}
