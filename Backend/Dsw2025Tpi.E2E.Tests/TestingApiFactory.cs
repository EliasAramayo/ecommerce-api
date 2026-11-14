using System;
using System.Collections.Generic;
using Dsw2025Tpi.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace Dsw2025Tpi.E2E.Tests;

public sealed class TestingApiFactory
    : WebApplicationFactory<Dsw2025Tpi.Api.Program>
{
    private const string TestingEnvironment = "Testing";

    protected override IHost CreateHost(IHostBuilder builder)
    {
        // Supply test settings before Program reads the JWT configuration.
        builder.ConfigureHostConfiguration(configuration =>
        {
            configuration.AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    [HostDefaults.EnvironmentKey] = TestingEnvironment,
                    ["Jwt:Key"] =
                        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                    ["Jwt:Issuer"] = "Dsw2025Tpi.E2E.Tests",
                    ["Jwt:Audience"] = "Dsw2025Tpi.E2E.Client",
                    ["Jwt:ExpireInMinutes"] = "60"
                });
        });

        var host = builder.Build();

        try
        {
            host.Start();
            return host;
        }
        catch
        {
            host.Dispose();
            throw;
        }
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices((context, services) =>
        {
            if (!context.HostingEnvironment.IsEnvironment(TestingEnvironment))
            {
                throw new InvalidOperationException(
                    "TestingApiFactory requires the Testing environment.");
            }

            services.RemoveAll<
                IDbContextOptionsConfiguration<Dsw2025TpiContext>>();
            services.RemoveAll<DbContextOptions<Dsw2025TpiContext>>();
            services.RemoveAll<DbContextOptions>();
            services.RemoveAll<Dsw2025TpiContext>();

            // The host owns this connection and disposes it on shutdown.
            services.AddSingleton<SqliteConnection>(_ =>
            {
                var connection = new SqliteConnection(
                    "Data Source=:memory:;Pooling=False");

                try
                {
                    connection.Open();
                    return connection;
                }
                catch
                {
                    connection.Dispose();
                    throw;
                }
            });

            services.AddDbContext<Dsw2025TpiContext>((provider, options) =>
                options.UseSqlite(
                    provider.GetRequiredService<SqliteConnection>(),
                    contextOwnsConnection: false));
        });
    }
}