# WebApp: Employee Management

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) and [Docker Compose](https://docs.docker.com/compose/)

## Quick Start

1. **Clone this repository** and open the project folder.

2. **Build and start the containers in detached mode:**
   ```sh
   docker compose up -d --build
   ```

3. **Access the app:**
   - **Frontend (UI):** [http://localhost:4173](http://localhost:4173)
   - **Backend (API):** [http://localhost:5000](http://localhost:5000)

4. **Default Login:**
   - Username: `admin`
   - Password: `admin`
   - Role: `edit`

   The default admin user is created automatically on first startup.

## Development

- The backend code is in `webapp-server/`
- The frontend code is in `webapp-ui/`
- The SQLite database is persisted as `webapp-server/employees.db`

## Useful Commands

- Stop the app:  
  ```sh
  docker compose down
  ```
- Rebuild after code changes:  
  ```sh
  docker compose up -d --build
  ```

---

**Note:**  
If you want to change the default admin credentials, edit the logic in `webapp-server/app.py` before building the containers.
