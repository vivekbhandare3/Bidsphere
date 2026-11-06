# BidSphere – Online Real-Time Auction System

BidSphere is a full-stack online auction platform that allows users to create auctions, browse products, place real-time bids, and track bidding history. The application uses Spring Boot for backend services, React.js for the frontend, MySQL for persistent storage, Redis for caching, and Firebase Realtime Database for live auction updates.

## 🚀 Features

- **User Authentication & Authorization:** Secure authentication using Spring Security, OAuth 2.0 and JWT.
- **Auction Management:** Create, manage, and browse product auctions.
- **Real-Time Bidding:** Place bids and synchronize live auction prices and highest bidders using Firebase Realtime Database.
- **Bid History:** Track previous bids and bidder information.
- **Redis Caching:** Implemented Spring Cache with Redis for auction listings and auction details using the cache-aside pattern.
- **Cache Optimization:** Cache eviction after successful bids and randomized TTL to reduce stale cache entries.
- **Bloom Filter:** Redis Bloom-filter-based membership checks to help prevent unnecessary database lookups for nonexistent auction IDs.
- **Image Management:** Upload and display auction product images.
- **Cloud Deployment:** Containerized backend deployment using Docker and AWS.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Backend | Java, Spring Boot |
| Security | Spring Security, OAuth 2.0, JWT |
| ORM | Spring Data JPA, Hibernate |
| Frontend | React.js, JavaScript, Tailwind CSS |
| Database | MySQL |
| Caching | Redis, Spring Cache |
| Real-Time Updates | Firebase Realtime Database |
| Containerization | Docker |
| Cloud | AWS ECS, ECR, RDS, S3, ALB, CloudFront |
| CI/CD | AWS CodeBuild, CodePipeline, GitHub Actions |
| Build Tools | Maven, npm |

## 🏗️ Architecture

```text
                 Users
                   |
                   v
             React Frontend
                   |
                   v
             AWS CloudFront
                   |
                   v
              Backend API
             Spring Boot
                   |
          +--------+--------+
          |        |        |
          v        v        v
        MySQL    Redis   Firebase
        (RDS)   Cache    Realtime DB
          |
          v
      Auction & Bid
        Records
```

### Backend Deployment

- Docker is used to containerize the Spring Boot application.
- Amazon ECR stores backend Docker images.
- Amazon ECS runs the backend containers.
- Amazon RDS hosts the MySQL database.
- Application Load Balancer handles incoming backend traffic.

### Frontend Deployment

- React frontend is built using Vite.
- Production static assets are hosted on Amazon S3.
- CloudFront provides content delivery.

## 📂 Project Structure

```text
BidSphere/
│
├── BidsphereBackend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── in/hp/main/
│   │   │   │       ├── config/
│   │   │   │       ├── controller/
│   │   │   │       ├── dto/
│   │   │   │       ├── model/
│   │   │   │       ├── repository/
│   │   │   │       ├── security/
│   │   │   │       └── service/
│   │   │   └── resources/
│   │   └── test/
│   ├── Dockerfile
│   └── pom.xml
│
├── BidsphereFrontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── api/
│   │   └── firebase.js
│   ├── package.json
│   └── vite.config.js
│
└── .github/
```

## ⚙️ Local Setup

### Prerequisites

Install the following:

- Java (version compatible with the Maven configuration)
- Node.js and npm
- MySQL
- Redis
- Firebase project with Realtime Database enabled
- Maven (or use the included Maven Wrapper)
- Docker (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/USERNAME/BidSphere.git
cd BidSphere
```

### 2. Backend Configuration

Configure the following in your local backend environment:

- MySQL database URL, username and password.
- Redis connection settings.
- JWT signing secret.
- Firebase Realtime Database URL.
- Firebase service account credentials.

Keep sensitive configuration in local environment variables or an external secrets manager.

### 3. Start the Backend

Navigate to the backend directory:

```bash
cd BidsphereBackend
```

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
./mvnw spring-boot:run
```

Alternatively:

```bash
mvn spring-boot:run
```

### 4. Frontend Configuration

Navigate to the frontend directory:

```bash
cd BidsphereFrontend
```

Install dependencies:

```bash
npm install
```

Configure the frontend API URL in a local `.env` file:

```env
VITE_API_URL=http://localhost:8080/api
```

Configure any additional image URL variables required by your application.

### 5. Start the Frontend

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

## ⚡ Redis Implementation

Redis is integrated into the application to improve performance and reduce repeated database queries.

**Caching strategy:**
- Spring Cache with Redis.
- Cache-aside pattern for auction listings and details.
- Custom cache keys based on search filters, sorting and pagination.
- Cache eviction after successful bidding.
- Randomized TTL to reduce synchronized cache expiration.

**Bloom Filter:**

Redis Bloom Filter is used for auction ID membership checks.

It helps identify IDs that are definitely absent from the filter, reducing unnecessary database lookups.

## 🔥 Firebase Integration

Firebase Realtime Database synchronizes live auction information, including:

- Current auction price.
- Highest bidder.

After a successful bid transaction, the backend asynchronously updates the corresponding Firebase auction data.

MySQL remains the persistent database for auction and bid records.

## ☁️ AWS Deployment

The application uses the following AWS services:

| AWS Service | Purpose |
|---|---|
| Amazon ECS | Backend container hosting |
| Amazon ECR | Docker image repository |
| Amazon RDS | Managed MySQL database |
| Amazon S3 | Frontend hosting and image storage |
| Application Load Balancer | Backend traffic distribution |
| CloudFront | Content delivery |
| CodeBuild | Backend build and Docker image creation |
| CodePipeline | Backend deployment automation |
| GitHub Actions | Frontend CI/CD |

## 🔐 Security

- Never commit `.env` files or application configuration containing secrets.
- Keep Firebase service account JSON files outside the Git repository.
- Store production credentials securely using AWS Secrets Manager or an equivalent secret-management solution.
- Configure appropriate Firebase Realtime Database security rules.
- Restrict database and Redis access to authorized services.

## 👨‍💻 Author

**Vivek Bhandare**

Java Backend Developer | Spring Boot | React.js | MySQL | Redis | AWS

---

⭐ If you find this project interesting, consider giving the repository a star!
