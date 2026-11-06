FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY ./target/*.jar /app/Bidsphere.jar

EXPOSE 8080

CMD ["java","-jar","/app/Bidsphere.jar"]
