# 💳 PayWallet - Microservices Payment Platform

A production-grade, microservices-based payment ecosystem deployed on AWS EKS.

## 🚀 Architecture Overview
This project consists of 11 Spring Boot microservices and an Angular frontend:
- **Core Services:** User, Wallet, Transaction, Payment, KYC.
- **Infrastructure:** Eureka Server, Config Server, API Gateway.
- **Support:** Admin, Notification, Rewards.
- **Messaging:** RabbitMQ for asynchronous processing.
- **Database:** Amazon RDS (PostgreSQL).

## 🛠 CI/CD Pipeline
The project utilizes GitHub Actions for automated deployment:
1. **CI:** Build Maven JARs and Docker Images on every push.
2. **Registry:** Pushes versioned images to Docker Hub.
3. **CD:** Automatically updates the AWS EKS cluster using `kubectl set image`.

---
> [!NOTE]
> This file was added to test and demonstrate the automated CI/CD pipeline.
