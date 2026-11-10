using System;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Dsw2025Tpi.E2E.Tests;

public class ProductsE2ETests
{
    [Fact]
    public async Task AdminCreatesProduct_VisitorCanRetrieveIt()
    {
        await using var factory = new TestingApiFactory();

        const string username = "e2e-products-admin";
        const string password = "E2e-Only!Pass123";

        // Arrange a test-owned administrator using real Identity services.
        using (var scope = factory.Services.CreateScope())
        {
            var userManager = scope.ServiceProvider
                .GetRequiredService<UserManager<IdentityUser>>();

            var user = new IdentityUser
            {
                UserName = username,
                Email = "e2e-products-admin@example.invalid",
                EmailConfirmed = true
            };

            var createResult = await userManager.CreateAsync(user, password);

            Assert.True(
                createResult.Succeeded,
                string.Join("; ", createResult.Errors.Select(e => e.Description)));

            var roleResult = await userManager.AddToRoleAsync(user, "ADMIN");

            Assert.True(
                roleResult.Succeeded,
                string.Join("; ", roleResult.Errors.Select(e => e.Description)));
        }

        var clientOptions = new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            AllowAutoRedirect = false,
            HandleCookies = false
        };

        using var adminClient = factory.CreateClient(clientOptions);
        using var visitorClient = factory.CreateClient(clientOptions);

        // Authenticate through the real login endpoint.
        using var loginResponse = await adminClient.PostAsJsonAsync(
            "/api/auth/login",
            new { username, password });

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        using var loginJson = JsonDocument.Parse(
            await loginResponse.Content.ReadAsStringAsync());

        var token = loginJson.RootElement.GetProperty("token").GetString();

        Assert.False(
            string.IsNullOrWhiteSpace(token),
            "Login must return a nonblank token.");

        adminClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Create a product through the ADMIN-protected endpoint.
        var product = new
        {
            sku = "E2E-001",
            internalCode = "INT-E2E-001",
            name = "Gaming Headset",
            description = "Test product",
            currentUnitPrice = 59.99m,
            stockQuantity = 30
        };

        using var createResponse = await adminClient.PostAsJsonAsync(
            "/api/products",
            product);

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        using var createdJson = JsonDocument.Parse(
            await createResponse.Content.ReadAsStringAsync());

        var productId = createdJson.RootElement.GetProperty("id").GetGuid();

        Assert.NotEqual(Guid.Empty, productId);

        // Retrieve the saved product as an anonymous visitor.
        Assert.True(
            visitorClient.DefaultRequestHeaders.Authorization is null,
            "The visitor must remain anonymous.");

        using var getResponse = await visitorClient.GetAsync(
            $"/api/products/{productId}");

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        using var retrievedJson = JsonDocument.Parse(
            await getResponse.Content.ReadAsStringAsync());

        var actual = retrievedJson.RootElement;

        Assert.Equal(productId, actual.GetProperty("id").GetGuid());
        Assert.Equal(product.sku, actual.GetProperty("sku").GetString());
        Assert.Equal(product.internalCode, actual.GetProperty("internalCode").GetString());
        Assert.Equal(product.name, actual.GetProperty("name").GetString());
        Assert.Equal(product.description, actual.GetProperty("description").GetString());
        Assert.Equal(product.currentUnitPrice, actual.GetProperty("currentUnitPrice").GetDecimal());
        Assert.Equal(product.stockQuantity, actual.GetProperty("stockQuantity").GetInt32());
        Assert.True(actual.GetProperty("isActive").GetBoolean());
    }
}