using System.Net;
using System.Net.Http.Json;
using Dsw2025Tpi.Application.Dtos;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Headers;
using Dsw2025Tpi.Application.Services;
using Dsw2025Tpi.Data;
using Dsw2025Tpi.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.IntegrationTests;

public class OrdersIntegrationTests
{
    [Fact]
    public async Task CreateOrder_WhenUnauthenticated_ReturnsUnauthorized()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var request = new OrderModel.OrderRequest(
            Guid.NewGuid(),
            "Dirección de envío de prueba",
            "Dirección de facturación de prueba",
            new List<OrderItemModel.OrderItemRequest>
            {
                new(Guid.NewGuid(), 1)
            });

        using var response = await client.PostAsJsonAsync("/api/orders", request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
        [Fact]
    public async Task CreateOrder_WithValidData_ReturnsCreatedAndPersistsOrderAndStock()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var product = new Product(
            "PI05-01", "P05", "Mouse Gamer", "Producto de prueba", 150m, 10);

        var customer = new Customer
        {
            Name = "Cliente PI-05",
            Email = "cliente-pi05@example.com"
        };

        using (var scope = factory.Services.CreateScope())
        {
            var users = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
            var admin = await users.FindByNameAsync("admin");
            Assert.NotNull(admin);
            customer.IdentityUserId = admin.Id;

            var database = scope.ServiceProvider.GetRequiredService<Dsw2025TpiContext>();
            database.Set<Customer>().Add(customer);
            database.Set<Product>().Add(product);
            await database.SaveChangesAsync();

            var tokenService = scope.ServiceProvider.GetRequiredService<JwtTokenService>();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                "Bearer", tokenService.GenerateToken("admin", "ADMIN"));
        }

        var request = new OrderModel.OrderRequest(
            customer.Id,
            "Dirección de envío de prueba",
            "Dirección de facturación de prueba",
            new List<OrderItemModel.OrderItemRequest>
            {
                new(product.Id, 3)
            });

        using var response = await client.PostAsJsonAsync("/api/orders", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        using var verificationScope = factory.Services.CreateScope();
        var verificationDatabase =
            verificationScope.ServiceProvider.GetRequiredService<Dsw2025TpiContext>();

        var order = await verificationDatabase.Set<Order>()
            .Include(order => order.OrderItem)
            .SingleAsync(order => order.CustomerId == customer.Id);

        Assert.Equal($"/api/orders/{order.Id}", response.Headers.Location?.ToString());
        Assert.Equal(450m, order.TotalAmount);

        var item = Assert.Single(order.OrderItem);
        Assert.Equal(product.Id, item.ProductId);
        Assert.Equal(3, item.Quantity);

        var savedProduct = await verificationDatabase.Set<Product>()
            .SingleAsync(saved => saved.Id == product.Id);
        Assert.Equal(7, savedProduct.StockQuantity);
    }

          [Fact]
    public async Task CreateOrder_WhenStockIsInsufficient_ReturnsBadRequestWithErrorMessage()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var product = new Product(
            "PI06-01", "P06", "Mouse Gamer", "Producto de prueba", 150m, 2);

        var customer = new Customer
        {
            Name = "Cliente PI-06",
            Email = "cliente-pi06@example.com"
        };

        using (var scope = factory.Services.CreateScope())
        {
            var users = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
            var admin = await users.FindByNameAsync("admin");
            Assert.NotNull(admin);
            customer.IdentityUserId = admin.Id;

            var database = scope.ServiceProvider.GetRequiredService<Dsw2025TpiContext>();
            database.Set<Customer>().Add(customer);
            database.Set<Product>().Add(product);
            await database.SaveChangesAsync();

            var tokenService = scope.ServiceProvider.GetRequiredService<JwtTokenService>();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                "Bearer", tokenService.GenerateToken("admin", "ADMIN"));
        }

        var request = new OrderModel.OrderRequest(
            customer.Id,
            "Dirección de envío de prueba",
            "Dirección de facturación de prueba",
            new List<OrderItemModel.OrderItemRequest>
            {
                new(product.Id, 5)
            });

        using var response = await client.PostAsJsonAsync("/api/orders", request);
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("Stock insuficiente", body);

        using var verificationScope = factory.Services.CreateScope();
        var verificationDatabase =
            verificationScope.ServiceProvider.GetRequiredService<Dsw2025TpiContext>();

        var savedProduct = await verificationDatabase.Set<Product>()
            .SingleAsync(saved => saved.Id == product.Id);

        Assert.Equal(2, savedProduct.StockQuantity);
        Assert.False(await verificationDatabase.Set<Order>()
            .AnyAsync(order => order.CustomerId == customer.Id));

        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        using var json = System.Text.Json.JsonDocument.Parse(body);
        Assert.Contains("Stock insuficiente", json.RootElement.GetProperty("message").GetString());
    }
}