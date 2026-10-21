# Etapa 1: Construcción (Multi-Stage Build)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiamos todo el código de la carpeta Backend al contenedor
COPY . .

# Nos movemos a la carpeta de la API y restauramos las dependencias
WORKDIR /src/Dsw2025Tpi.Api
RUN dotnet restore

# Compilamos el proyecto en modo Release
RUN dotnet publish -c Release -o /app/publish

# Etapa 2: Ejecución
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Inyectamos las variables de entorno exigidas para que Swagger funcione
ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_HTTP_PORTS=8080
ENV ConnectionStrings__Dsw2025TpiEntities="Server=sqlserver;Database=Dsw2025Db;User Id=sa;Password=TuPasswordSeguro123!;TrustServerCertificate=True;"


# Copiamos solo el resultado compilado de la etapa anterior
COPY --from=build /app/publish .

# Exponemos el puerto
EXPOSE 8080

# Punto de entrada de la aplicación
ENTRYPOINT ["dotnet", "Dsw2025Tpi.Api.dll"]
