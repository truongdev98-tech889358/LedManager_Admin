# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081


# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y libpng-dev libjpeg-dev curl libxi6 build-essential libgl1-mesa-glx
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs
COPY ["LedManager.Server/LedManager.Server.csproj", "LedManager.Server/"]
COPY ["LedManager.Core/LedManager.Core.csproj", "LedManager.Core/"]
COPY ["LedManager.Application/LedManager.Application.csproj", "LedManager.Application/"]
COPY ["LedManager.Infrastructure/LedManager.Infrastructure.csproj", "LedManager.Infrastructure/"]
COPY ["ledmanager.client/ledmanager.client.esproj", "ledmanager.client/"]
COPY ["ledmanager.client/package.json", "ledmanager.client/"]
COPY ["ledmanager.client/package-lock.json", "ledmanager.client/"]
RUN dotnet restore "./LedManager.Server/LedManager.Server.csproj"
COPY . .
WORKDIR "/src/ledmanager.client"
RUN npm install
RUN npm run build

WORKDIR "/src/LedManager.Server"
RUN dotnet build "./LedManager.Server.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./LedManager.Server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false
RUN mkdir -p /app/publish/wwwroot
RUN cp -r /src/ledmanager.client/dist/* /app/publish/wwwroot/

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "LedManager.Server.dll"]
USER root
RUN mkdir -p /app/wwwroot/uploads
RUN mkdir -p /app/wwwroot/thumbnails
RUN chown -R $APP_UID:$APP_UID /app/wwwroot
RUN chmod 777 /app/wwwroot/uploads
RUN chmod 777 /app/wwwroot/thumbnails
USER $APP_UID
