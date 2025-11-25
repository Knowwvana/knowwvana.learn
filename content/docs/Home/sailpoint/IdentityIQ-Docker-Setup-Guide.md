# SailPoint IdentityIQ 8.4 – Docker Dev Environment (DevDays 2025)

This guide explains, **step by step**, how to set up a **local SailPoint IdentityIQ 8.4 development environment** using:

- SailPoint Developer Days Docker reference:
  - “Leveraging SailPoint IdentityIQ and Docker for seamless development” (Dev Days session)
- GitHub repo:
  - `iiq-docker-developer-days-2025` (Yannick Beot – SailPoint)
- Official IdentityIQ 8.4 distribution from SailPoint Compass

The goal is that **anyone** can follow this and get IdentityIQ running locally on Docker Desktop from scratch.

> ⚠️ **Important:**  
> This setup is intended for **local development / training only**, not for production.  
> In production, IdentityIQ is typically deployed on dedicated app servers (Tomcat/Jetty) with an external DB and HA architecture.

---

## 1. Prerequisites

Before you start, you must have:

### 1.1. Software on your machine

- **Windows 10/11** with:
  - **WSL2** enabled
  - **Virtualization** turned on in BIOS
- **Docker Desktop** (WSL2 backend)
- **Visual Studio Code** (optional but highly recommended)
- **Git** (for cloning the repo)
- **SailPoint IdentityIQ 8.4 installer ZIP**  
  - Downloaded from SailPoint Compass (official product download page)
  - You must have a valid SailPoint subscription / license to access this

**Why this matters**

- Docker Desktop uses WSL2 to run Linux containers; IdentityIQ runs in a Linux-based Tomcat container, and MySQL runs in another container.
- The official IdentityIQ 8.4 installer contains:
  - `identityiq.war` – the web application
  - `database/` – SQL scripts to create the IdentityIQ schema

---

## 2. Get the DevDays Docker Project

### 2.1. Clone or download the GitHub repository

Create a working folder, e.g.:

```text
C:\work\iiq-docker\
```

Then either:

**Option A: Clone via Git**

```bash
cd C:\work\iiq-docker
git clone https://github.com/yannick-beot-sp/iiq-docker-developer-days-2025.git
```

**Option B: Download ZIP via GitHub UI**

- Navigate to the DevDays repo in your browser.
- Click **Code → Download ZIP**.
- Extract the ZIP into `C:\work\iiq-docker\iiq-docker-developer-days-2025`.

### 2.2. Repo structure (simplified)

You should now have something like:

```text
iiq-docker-developer-days-2025
├─ configuration/
├─ ldap/
├─ scripts/
├─ volumes/
├─ Dockerfile.simple
├─ Dockerfile.mysql-simple
├─ docker-compose.simple.yml
├─ docker-compose.simple-all.yml
├─ .env.sample
└─ ...
```

**What these are for**

- `Dockerfile.simple` – builds the **IdentityIQ application image** (Tomcat + identityiq.war).
- `Dockerfile.mysql-simple` – builds the **MySQL database image** (MySQL + IdentityIQ DB scripts).
- `docker-compose.simple.yml` – minimal stack: **IIQ + MySQL**.
- `docker-compose.simple-all.yml` – extended stack: **IIQ + MySQL + LDAP + MailDev + LDAP Admin**, etc.
- `volumes/` – Docker bind mounts for persistence (e.g., MySQL data).

For a **simple, focused setup**, we’ll use:

- `Dockerfile.mysql-simple`
- `Dockerfile.simple`
- `docker-compose.simple.yml`

---

## 3. Add IdentityIQ 8.4 Binaries to the Project

The DevDays repo does **not** ship IdentityIQ binaries. You must supply them.

### 3.1. Create the `identityiq-8.4` folder

Inside the repo folder:

```text
iiq-docker-developer-days-2025
└─ identityiq-8.4
```

### 3.2. Unzip the official IdentityIQ distribution

From the Compass download, unzip the official IdentityIQ 8.4 ZIP into `identityiq-8.4` so that you have at least:

```text
identityiq-8.4
├─ database/
│  ├─ create_identityiq_tables-8.4.sql
│  ├─ create_identityiq_plugins_db.sql
│  ├─ zzz_create_identityiq_ah_db.sql
│  └─ ...
└─ identityiq.war
```

**Why this matters**

- `identityiq.war` is used by **Dockerfile.simple** to build the IIQ app image.
- `database/` SQL scripts are used by **Dockerfile.mysql-simple** to build the DB image that initializes MySQL with the IdentityIQ schema.

---

## 4. Configure Environment Variables (`.env`)

The compose files and Dockerfiles rely on environment variables from a `.env` file.

### 4.1. Create `.env` from `.env.sample`

From the repo root:

1. Copy `.env.sample` → `.env`
2. Open `.env` in VS Code.

Example minimal content:

```ini
MYSQL_ROOT_PASSWORD=YourStrongRootPassword123!
IIQ_VERSION=8.4
LDAP_ADMIN_PASSWORD=SomeStrongLdapPassword!   # Used only if you use the ALL stack
```

**What each variable means**

- `MYSQL_ROOT_PASSWORD`  
  Root password for MySQL container. Used by the MySQL initialization to create the schema and allow access as root.

- `IIQ_VERSION`  
  Used to construct the MySQL data volume path, e.g. `./volumes/mysql-8.4`. Helps separate data for different IIQ versions.

- `LDAP_ADMIN_PASSWORD`  
  Used by OpenLDAP (only relevant for `docker-compose.simple-all.yml`).

> ✅ **Important:** `.env` must be in the **same folder** as the compose file and must have **no extra extension** (`.env`, not `.env.txt`).

---

## 5. Understanding the Simple Stack (`docker-compose.simple.yml`)

The key services in `docker-compose.simple.yml`:

```yaml
version: '3'
services:
  iiq:
    image: iiq:latest
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    networks:
      - app-network

  mysql:
    image: mysql-iiq:latest
    ports:
      - "3306:3306"
    command: --mysql-native-password=ON
    environment:
      - MYSQL_ROOT_PASSWORD
    volumes:
      - ./volumes/mysql-${IIQ_VERSION}:/var/lib/mysql
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

**Meaning of each part**

- `iiq` service:
  - Uses `iiq:latest` image (built from `Dockerfile.simple`).
  - Exposes port `8080` → you access IIQ at `http://localhost:8080/identityiq`.
  - `depends_on: mysql` ensures MySQL container is started before IIQ.

- `mysql` service:
  - Uses `mysql-iiq:latest` image (built from `Dockerfile.mysql-simple`).
  - Exposes MySQL on port `3306` for local tools (e.g. MySQL Workbench / phpMyAdmin).
  - `command: --mysql-native-password=ON` ensures MySQL uses native password plugin, compatible with IdentityIQ settings.
  - `environment: - MYSQL_ROOT_PASSWORD` reads the root password from `.env`.
  - `volumes: ./volumes/mysql-${IIQ_VERSION}:/var/lib/mysql` persists the MySQL data on your local filesystem.

- `app-network`:
  - A Docker bridge network that allows containers (`iiq` and `mysql`) to talk to each other by service name.

---

## 6. (Optional But Recommended) Add phpMyAdmin for DB GUI

For development, a MySQL GUI helps inspect schema and troubleshoot problems. You can add **phpMyAdmin** to `docker-compose.simple.yml`:

```yaml
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    restart: unless-stopped
    ports:
      - "8081:80"
    environment:
      PMA_HOST: mysql
      PMA_PORT: 3306
    depends_on:
      - mysql
    networks:
      - app-network
```

**Meaning**

- `phpmyadmin` connects to the `mysql` service internally via Docker network.
- Exposes a web GUI at `http://localhost:8081`.
- Uses `PMA_HOST=mysql` so it connects to the MySQL container using its service name.

---

## 7. Build the MySQL Image (`mysql-iiq:latest`)

### 7.1. Build the custom MySQL image

From the repo root:

```bash
docker build -t mysql-iiq:latest -f Dockerfile.mysql-simple .
```

**What `Dockerfile.mysql-simple` does (conceptually)**

- Starts from a `mysql:8.x` base image.
- Copies the IdentityIQ DB scripts from `identityiq-8.4/database` into `/docker-entrypoint-initdb.d`.
- On first container startup, MySQL automatically:
  - Initializes its base data (system tables).
  - Runs all `.sql` files inside `/docker-entrypoint-initdb.d`.
  - This creates:
    - `identityiq` schema (main IIQ DB)
    - `identityiq_ah` schema (Audit History DB)
    - All required tables, indexes, constraints, etc.

**Why this step is important**

Instead of manually running `create_identityiq_tables-8.4.sql` etc. on a standalone DB, this Docker image automates the **official installation guide’s DB initialization steps**.

---

## 8. Start MySQL (and phpMyAdmin) Alone First

Before starting IIQ, it’s a good practice to verify MySQL is healthy and the schema is created.

### 8.1. Start only `mysql` (and optional `phpmyadmin`)

```bash
docker compose -f docker-compose.simple.yml up mysql phpmyadmin
```

### 8.2. Access phpMyAdmin (optional)

- Open: `http://localhost:8081`
- Server: `mysql`
- User: `root`
- Password: the value from `.env` (`MYSQL_ROOT_PASSWORD`)

You should see databases such as:

- `identityiq`
- `identityiq_ah`
- `mysql`
- `performance_schema`
- `sys`

And tables like `spt_identity`, `spt_task`, etc. (they will be empty initially).

> ✅ At this stage, the **schema exists but there are no identities yet**.  
> This is expected — the initial admin (`spadmin`) is **created by IdentityIQ application at first startup**, not by DB scripts.

---

## 9. Build the IdentityIQ Application Image (`iiq:latest`)

### 9.1. Build the `iiq` image

From repo root:

```bash
docker build -t iiq:latest -f Dockerfile.simple .
```

**What `Dockerfile.simple` does (conceptually)**

- Uses a Tomcat base image (e.g., `tomcat:9-jdk`).
- Copies `identityiq-8.4/identityiq.war` into the Tomcat webapps folder.
- Copies `configuration/` and any custom config/overrides.
- The result is an image that, when started, deploys IdentityIQ at `/identityiq` in Tomcat.

---

## 10. Start the Full Simple Stack (IIQ + MySQL + phpMyAdmin)

Once both images (`mysql-iiq:latest` and `iiq:latest`) are built:

```bash
docker compose -f docker-compose.simple.yml up
```

This will:

- Start **MySQL** (using the initialized DB from the volume).
- Start **phpMyAdmin** (if configured).
- Start **IdentityIQ** (IIQ) on Tomcat.

Watch the logs for the `iiq` container:

- Deployment of `/usr/local/tomcat/webapps/identityiq`
- Server startup messages like:

  ```text
  Deploying web application directory [/usr/local/tomcat/webapps/identityiq]
  Deployment of web application directory [...] has finished
  Server startup in [XXXXX] milliseconds
  ```

Once you see **“Server startup in … ms”** for Tomcat, IdentityIQ should be ready.

---

## 11. Access IdentityIQ and Initial Login

### 11.1. Open IdentityIQ in the browser

Navigate to:

```text
http://localhost:8080/identityiq
```

You should see the SailPoint IdentityIQ login page.

### 11.2. Default bootstrap admin

On a fresh install (using default configuration), the initial admin user is created by IdentityIQ’s bootstrap on first startup, based on the `init.xml` configuration.

Common default:

- **Username:** `spadmin`  
- **Password:** `admin`

> These are **not** in the SQL scripts. They are defined in `init.xml` (in the IIQ web app) and written to the DB on first startup.

---

## 12. Verify Bootstrap Data in the Database

Once you have logged in to IdentityIQ:

1. Open phpMyAdmin (`http://localhost:8081`).
2. Select the `identityiq` database.
3. Run:

   ```sql
   SELECT name, displayName FROM spt_identity;
   ```

You should now see at least:

- `spadmin | System Administrator`

Additionally, other tables such as `spt_application`, `spt_task`, `spt_bundle` will have initial entries created by the bootstrap process.

This confirms that:

- The application is correctly connected to the database.
- IdentityIQ bootstrap has completed successfully.
- The environment is ready for development and configuration.

---

## 13. Where Key Files Live (Inside the Containers)

### 13.1. IdentityIQ app files (IIQ container)

Attach a shell to the `iiq` container (via VS Code Docker extension or CLI):

```bash
docker exec -it <iiq-container-name> /bin/bash
```

Important paths:

```text
/usr/local/tomcat/webapps/identityiq
└─ WEB-INF/
   ├─ config/
   │  ├─ sailpoint/
   │  │  ├─ init.xml
   │  │  ├─ iiq.properties
   │  │  └─ ...
   │  ├─ workflow/
   │  └─ ...
   └─ lib/
```

- `init.xml` – Bootstrap configuration (initial admin identity, etc.).
- `iiq.properties` – IdentityIQ configuration (DB, logging, etc.).

> By default in this Docker setup, IIQ config files are **not** mounted as a volume – they live inside the container.  
> This is fine for local dev. For advanced dev, you can mount them to a local folder.

### 13.2. Database data files (MySQL container)

In the MySQL container:

```bash
/var/lib/mysql
```

On your host (Windows):

```text
iiq-docker-developer-days-2025/volumes/mysql-8.4/
```

This is where MySQL persists all databases and tables.

---

## 14. Notes on Production vs. This Dev Setup

- In **production**, IdentityIQ is usually deployed:
  - On multiple app servers (Tomcat) behind a load balancer.
  - Using an external, managed database (Oracle, MS SQL, or MySQL).
  - Application servers are stateless; all persistence is in the DB.

- In this **DevDays Docker setup**:
  - IdentityIQ runs in a single Tomcat container (`iiq`).
  - MySQL runs in a single container (`mysql`).
  - MySQL data is persisted via a host-mounted volume.
  - Application files (WAR, config) live inside the container and can be rebuilt from the repo + IdentityIQ installer.

---

## 15. Troubleshooting Tips

### 15.1. phpMyAdmin “Connection refused”

- Ensure MySQL container is running:

  ```bash
  docker ps
  ```

- If phpMyAdmin started before MySQL finished initializing, restart it:

  ```bash
  docker restart <phpmyadmin-container-name>
  ```

- Ensure `PMA_HOST=mysql` and `MYSQL_ROOT_PASSWORD` are set correctly.

### 15.2. IdentityIQ cannot connect to database

- Check `docker-compose.simple.yml` DB connection settings.
- Confirm `MYSQL_ROOT_PASSWORD` in `.env` matches the DB configuration in `iiq.properties` (if customized).
- Verify MySQL is listening on port 3306 and that the `identityiq` schema exists.

### 15.3. IdentityIQ starts but login fails

- Check the `spt_identity` table for the admin user (`spadmin`).
- Confirm password hash or reset it if necessary (advanced).
- Inspect the `iiq` container logs for authentication or Spring-related errors.

---

## 16. Summary

In this guide we:

1. Installed prerequisites (Docker Desktop with WSL2, VS Code, Git).
2. Cloned the **DevDays** Docker repo.
3. Added official IdentityIQ 8.4 binaries (`identityiq.war` + `database/`) into `identityiq-8.4/`.
4. Created a `.env` file with DB and version settings.
5. Built a custom **MySQL image** (`mysql-iiq:latest`) that auto-initializes the IdentityIQ schema.
6. (Optionally) added **phpMyAdmin** for DB management.
7. Built the **IdentityIQ app image** (`iiq:latest`).
8. Brought up the stack via `docker-compose.simple.yml`.
9. Logged into IdentityIQ at `http://localhost:8080/identityiq` using the bootstrap admin.
10. Verified database content (tables + initial identities) via phpMyAdmin.

With these steps, you now have a **repeatable, documented process** to bring up a full IdentityIQ 8.4 development environment on Docker using the SailPoint DevDays reference.

---
