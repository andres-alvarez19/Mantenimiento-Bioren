# Dockerfile para el backend (Spring Boot)
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests
EXPOSE 8080
CMD ["./mvnw", "spring-boot:run"]
