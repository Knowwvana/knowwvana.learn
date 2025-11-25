# SailPoint IIQ ➝ Azure Migration  
## A Complete Architecture & Step-by-Step Blueprint  
Author: Atul  
Version: 1.1  
Date: 2025-11-23  

---

# 📌 Overview  
This document provides a **complete, official, non-assumptive** blueprint for performing a **SailPoint IdentityIQ → Microsoft Azure (Entra ID + Identity Governance)** migration.  
It contains:

- What actually gets migrated  
- Architecture diagrams  
- Extraction → Transformation → Load phases  
- REST vs SPConfig vs SCIM (differences & usage)  
- Web-based Migration Platform Architecture  
- POC plan using ASP.NET + SPConfig + REST  
- Roadmap for the complete migration tool  

This is the **master overview document**.  
A detailed step-by-step migration guide will be created later during implementation.

---

# 🧩 1. What Actually Gets Migrated?

### ✔ Migratable (with transformation)
- Identities  
- Accounts  
- Roles  
- Entitlements  
- Group memberships  
- Application → Entitlement mappings  
- Certification definitions → Access Review equivalents  
- Identity lifecycle logic → Azure workflows  
- Provisioning logic → Azure SCIM provisioning  

### ❌ NOT directly migratable “as-is”
(Based on official documentation)

- Workflows (IIQ XML cannot run in Azure)  
- Rules (BeanShell not supported in Azure)  
- Task definitions (No Azure equivalent)  
- Application schema (Azure app model is different)  
- Application provisioning policies  
- Identity warehouse internals  
- Request Center  
- Joiner/Mover/Leaver logic  
- Forms (Azure has no equivalent)  
- Certification campaigns (cannot be imported)  

These **must be rebuilt** using Azure cloud components.

---

# 🧱 2. Migration Flow — High-Level Architecture

```
+----------------------+      Extract     +---------------------+    Transform   +------------------------+
|   SailPoint IIQ      | --------------> |   Export Layer       | -------------> | Azure Migration Engine |
| (On-Prem / VM)       |  Objects, XML   | (REST + SPConfig)    |   Map Schema   |   (Custom Scripts)     |
+----------------------+                 +---------------------+                +------------------------+
                                                                                         |
                                                                                         v
                                                                                 +---------------------+
                                                                                 |  Azure Identity     |
                                                                                 |  Governance (IGA)   |
                                                                                 +---------------------+
                                                                                 |  Entra ID           |
                                                                                 |  Access Packages    |
                                                                                 |  Access Reviews     |
                                                                                 |  SCIM Apps          |
                                                                                 +---------------------+
```

---

# 🧲 3. Extraction Phase (SPConfig + REST + SQL)

## ✔ SPConfig Export — For Configuration  
SPConfig is **required** for extracting:

- Applications (full definition)  
- Application schema  
- Workflows  
- Rules  
- Policies  
- Identity profiles  
- Managed attributes  
- Bundles  
- Forms  
- Lifecycle events  
- Correlation configs  
- Certification definitions  
- Task definitions  

REST and SCIM **cannot** extract these.

### Official API:
```
POST /identityiq/config/export
```

---

## ✔ REST API — For Identity + Operational Data  
REST is used for:

- Identities  
- Accounts (links)  
- Roles  
- Managed attributes (limited)  
- Work items  

REST delivers **JSON**, perfect for quick POCs and UI display.

---

## ✔ SQL — Deep Relationship Extraction  
SQL queries extract data REST does not fully expose:

- Identity → Account → Entitlement mappings  
- Application schema  
- Entitlement metadata  
- Role → Entitlement mapping  

SQL is supported in **read-only mode** (as per official guidance).

---

# 🎛 4. Transformation Phase  
Azure does not understand IIQ's objects.  
So the transformation layer:

- Converts IIQ roles → Azure Groups / Access Packages  
- Converts entitlements → Azure Groups / App Roles  
- Converts identities → Entra ID schema  
- Converts workflow logic → Logic Apps  
- Converts provisioning → SCIM app provisioning  
- Converts approval flows → Access Package policies  

This is **not automatic** — it requires a mapping engine.

---

# 🚀 5. Load Phase — Building in Azure  
Using **Microsoft Graph API**:

### ✔ Users  
```
POST /users
```

### ✔ Groups  
```
POST /groups
```

### ✔ App Roles / Enterprise App configuration  
```
POST /applications/{id}/appRoles
```

### ✔ Access Packages  
```
POST /identityGovernance/entitlementManagement/accessPackages
```

### ✔ Access Reviews  
```
POST /identityGovernance/accessReviews
```

### ✔ SCIM Provisioning  
For app provisioning.

---

# ⚙️ 6. Automation Framework — Migration Engine  
A reusable migration engine contains:

- SPConfig extraction module  
- REST extraction module  
- SQL extraction module  
- Mapping engine  
- Azure Graph loader  
- Validation engine  
- Reporting module  
- Incremental sync module  
- Rollback module  
- Multi-tenant support  

---

# 🏗 7. Architecture of a Reusable Web UI Migration Tool

```
ASP.NET Core 9 Web App
    |
    |-- Module 1: SPConfig Export Client
    |      (Triggers config export)
    |
    |-- Module 2: REST API Client
    |      (Extracts identities, roles)
    |
    |-- Module 3: SQL Extractor
    |      (Extracts entitlement mappings)
    |
    |-- Module 4: Mapping UI
    |      (IIQ → Azure transformation)
    |
    |-- Module 5: Azure Graph Loader
    |      (Creates users, groups, packages)
```

This tool is fully feasible and supported as long as it uses **official APIs**.

---

# 🔌 8. Export Tools — REST vs SPConfig vs SCIM  
## ✔ REST – What It’s For

| Purpose | Supported? |
|---------|------------|
| Identities | ✔ Yes |
| Roles | ✔ Yes |
| Accounts | ✔ Yes |
| Entitlements (partially) | ✔ Partial |
| Applications (metadata only) | ❌ Limited |
| Workflows | ❌ No |
| Rules | ❌ No |
| Policies | ❌ No |

**Use REST for:**  
→ Identity & role extraction  
→ Quick POC  
→ Lightweight UI consumption  

---

## ✔ SPConfig – What It’s For

| Purpose | Supported? |
|---------|------------|
| Applications | ✔ Full |
| Workflows | ✔ Full |
| Rules | ✔ Full |
| Policies | ✔ Full |
| Identity profiles | ✔ Yes |
| Certification definitions | ✔ Yes |
| Password policies | ✔ Yes |
| Bundles | ✔ Yes |
| Managed attributes | ✔ Yes |

**Use SPConfig for:**  
→ Application logic  
→ Workflow logic  
→ Schema definitions  
→ Anything configuration-related  

---

## ✔ SCIM – What It’s For

| Purpose | Supported? |
|---------|------------|
| Identities | ✔ |
| Groups | ✔ |
| Accounts | ✔ |
| Provisioning | ✔ |
| Workflows | ❌ |
| Schema | ❌ |
| Application definitions | ❌ |

**Use SCIM for:**  
→ Identity synchronization  
→ Provisioning proof-of-concepts  

**NOT for extraction.**

---

# 🧩 9. Summary — Putting It All Together

| Requirement | Use REST | Use SPConfig | Use SQL | Use SCIM |
|------------|----------|--------------|---------|----------|
| Identities | ✔ | ❌ | ✔ | ✔ |
| Accounts | ✔ | ❌ | ✔ | ✔ |
| Roles | ✔ | ✔ | ✔ | ❌ |
| Entitlements | ✔ (partial) | ✔ (full) | ✔ | ❌ |
| Application definitions | ❌ | ✔ | ✔ | ❌ |
| Workflows | ❌ | ✔ | ❌ | ❌ |
| Rules | ❌ | ✔ | ❌ | ❌ |
| Certification configs | ❌ | ✔ | ❌ | ❌ |
| Provisioning | ❌ | ❌ | ❌ | ✔ |
| Relationship graph | ❌ | ❌ | ✔ | ❌ |

---

# 🧭 10. Migration Roadmap

### **Phase 1 — Extraction (POC)**
- SPConfig export  
- REST extraction  
- SQL extraction  
- ASP.NET UI to view extracted data  

### **Phase 2 — Mapping**
- IIQ → Azure object model mapping  
- Mapping UI  
- Data validation  

### **Phase 3 — Transformation**
- Convert workflows  
- Convert rules  
- Convert provisioning logic  
- Prepare Azure models  

### **Phase 4 — Load**
- Create Azure users, groups, apps  
- Setup Access Packages  
- Setup Access Reviews  
- Setup SCIM provisioning  

### **Phase 5 — Incremental & Final Cutover**
- Delta extraction  
- Parallel run  
- Switchover  
- Decommission IIQ  

---

# 🏁 Conclusion
This document forms the **master migration blueprint** for SailPoint IIQ to Azure.  
The next step is building the **POC extraction engine** using:

- SPConfig REST API  
- IIQ REST API  
- ASP.NET Core 9  

This will evolve into a **full enterprise migration platform**.

---
