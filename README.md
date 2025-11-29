# Hostel Management System API 🏨

This is the backend REST API for the Hostel Management System. It handles accommodation management, including hubs, rooms, reservations, payments, and issue tracking.

## 🚀 Tech Stack
* **Language:** Java 21
* **Framework:** Spring Boot 4.0.0
* **Database:** MySQL
* **Tools:** Swagger / OpenAPI (for API Documentation), Maven, Lombok

## 📂 System Overview
The system manages the following components:
* **Hubs & Floors:** Managing building structures.
* **Rooms & Beds:** Allocation and availability status.
* **Reservations:** Student booking handling.
* **Payments:** Tracking payment status.
* **Issues:** Logging student complaints/maintenance issues.

## 🗂️ Database Design (ERD)
*(Upload your 'erdplus-4.jpg' image to the repo and link it here like this:)*
![ERD Diagram](./erdplus-4.jpg)

## 🛠️ Setup & Installation
1.  Clone the repository:
    ```bash
    git clone [https://github.com/your-username/hostel-management-backend.git](https://github.com/your-username/hostel-management-backend.git)
    ```
2.  Configure Database:
    * Create a MySQL database named `hostel_db`.
    * Update `src/main/resources/application.properties` with your credentials.
3.  Run the application:
    ```bash
    mvn spring-boot:run
    ```

## 📖 API Documentation
Once the server is running, you can access the Swagger UI at:
`http://localhost:8080/swagger-ui.html`
