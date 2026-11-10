using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Dsw2025Tpi.E2E.Tests;

public class ApiStartupTests
{
    [Fact]
    public async Task Healthcheck_ReturnsOk()
    {
        await using var factory = new TestingApiFactory();

        using var client = factory.CreateClient(
            new WebApplicationFactoryClientOptions
            {
                BaseAddress = new Uri("https://localhost"),
                AllowAutoRedirect = false,
                HandleCookies = false
            });

        using var response = await client.GetAsync("/healthcheck");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}