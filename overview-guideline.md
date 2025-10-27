# 🧠 Overview: Bullseye Revenue (GTM Intelligence Dashboard)

## 🤖 Who You Are (Claude Code)

You are a **full-stack autonomous development agent** building a **view-only GTM intelligence dashboard** for sales and marketing teams.

You are working within a GitHub-connected environment, with access to:
- A **Supabase PostgreSQL database** (your primary backend)
- The ability to generate and modify **Next.js (App Router) frontend code** with Tailwind CSS and ShadCN components

This is a **multi-tenant, read-only dashboard** where clients log in to view their enriched leads with actionable intelligence signals.

## 🔧 What You're Building

**Bullseye Revenue** is a $5k GTM intelligence platform that helps sales/marketing teams prioritize which leads to pursue.

### Core Value Props:
1. **Customer overlap detection** - "This lead previously worked at your customer"
2. **New in role signals** - Started current position within 30 days
3. **Funding signals** - Recently raised capital
4. **Growth signals** - Department/headcount expansion

### UI Features:
- Clay-style filterable table
- Hide/show columns
- Smart filters: "New in role", "Worked at my customers", "Recently funded", "Growing team"
- Clean, fast, professional interface

### This app is NOT:
- A data enrichment pipeline (handled separately)
- A CRM or contact management system
- An email sender

It is a **view-only intelligence layer** built on top of pre-enriched lead data.

## 🗃️ Database Architecture

### Core Principles:
1. **Minimal core tables** - `companies` and `people` stay lean
2. **Separate enrichment tables** - Funding, work history, signals live in dedicated tables
3. **Foreign key relationships** - Everything links via `person_id` or `company_id`
4. **Database views** - Create a `leads_view` that joins everything for the UI

---

### `companies` table (minimal)
```sql
- id (UUID, primary key)
- company_name (TEXT)
- company_domain (TEXT, unique)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

### `people` table (minimal)
```sql
- id (UUID, primary key)
- work_email (TEXT, unique, required)
- first_name (TEXT)
- last_name (TEXT)
- full_name (TEXT)
- company_id (UUID, foreign key to companies.id)
- current_title (TEXT)
- started_current_role_at (DATE) -- for "new in role" calculation
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

### `company_enrichment` table

Stores enrichment data per company.
```sql
- id (UUID, primary key)
- company_id (UUID, foreign key to companies.id, unique)
- industry (TEXT)
- employee_size (INTEGER)
- company_linkedin_url (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

### `company_funding` table

Stores funding events per company.
```sql
- id (UUID, primary key)
- company_id (UUID, foreign key to companies.id)
- funding_amount (NUMERIC)
- funding_date (DATE)
- funding_round (TEXT) -- e.g., "Series A", "Seed"
- created_at (TIMESTAMP)
```

---

### `person_work_history` table

**Flattened work history** - one row per past job.
```sql
- id (UUID, primary key)
- person_id (UUID, foreign key to people.id)
- company_domain (TEXT) -- domain of past employer
- company_name (TEXT)
- job_title (TEXT)
- start_date (DATE)
- end_date (DATE, nullable for current roles)
- created_at (TIMESTAMP)
```

---

### `person_enrichment` table

LinkedIn and other enriched data per person.
```sql
- id (UUID, primary key)
- person_id (UUID, foreign key to people.id, unique)
- person_linkedin_url (TEXT)
- profile_headline (TEXT)
- location (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

### `client_customers` table

**Multi-tenant**: Each client provides their customer list.
```sql
- id (UUID, primary key)
- client_id (UUID) -- links to auth/client system
- customer_company_domain (TEXT)
- customer_company_name (TEXT)
- created_at (TIMESTAMP)
```

---

### `leads_view` (Database View)

**This is what the UI queries.**

Joins all the tables together to create a flat, filterable structure:
```sql
CREATE VIEW leads_view AS
SELECT 
  p.id as person_id,
  p.work_email,
  p.first_name,
  p.last_name,
  p.full_name,
  p.current_title,
  p.started_current_role_at,
  
  c.company_name,
  c.company_domain,
  
  ce.industry,
  ce.employee_size,
  ce.company_linkedin_url,
  
  cf.funding_amount,
  cf.funding_date,
  cf.funding_round,
  
  pe.person_linkedin_url,
  pe.profile_headline,
  
  -- Calculated: New in role (within 30 days)
  CASE 
    WHEN p.started_current_role_at >= CURRENT_DATE - INTERVAL '30 days' 
    THEN true 
    ELSE false 
  END as new_in_role,
  
  -- Calculated: Worked at customer (EXISTS check via work history)
  EXISTS (
    SELECT 1 FROM person_work_history pwh
    JOIN client_customers cc ON pwh.company_domain = cc.customer_company_domain
    WHERE pwh.person_id = p.id
  ) as worked_at_customer

FROM people p
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN company_enrichment ce ON c.id = ce.company_id
LEFT JOIN company_funding cf ON c.id = cf.company_id
LEFT JOIN person_enrichment pe ON p.id = pe.person_id;
```

---

## 🎨 UI Requirements

### Main Dashboard:
- **Table view** with all leads from `leads_view`
- **Columns:** Name, Company, Domain, Industry, Employee Size, Title, New in Role (badge), Worked at Customer (badge), Funding Amount, Funding Date
- **Filters (top of page):**
  - Text search (name, company, title)
  - Dropdown: Industry
  - Dropdown: Employee size range
  - Toggle: "New in Role"
  - Toggle: "Worked at My Customers"
  - Toggle: "Recently Funded (6 months)"
- **Column visibility toggle** (hide/show columns)
- **No selection/staging** - view only

### Style:
- Clean, professional, fast
- Tailwind CSS + ShadCN components
- Responsive (mobile-friendly table)

---

## ✅ Success Criteria

- [ ] All tables created with proper foreign keys
- [ ] `leads_view` created and optimized
- [ ] UI displays leads with all enrichment data
- [ ] Filters work correctly (new in role, customer overlap, funding)
- [ ] Column visibility toggle works
- [ ] Multi-tenant ready (client_id filtering in place)
- [ ] Fast, clean, professional UI

---

## 📎 Final Notes

**Keep it simple.** This is a demo-able product to sell, not a full production system yet.

Focus on:
1. Clean schema that's easy to populate
2. Fast, impressive UI
3. Working filters for the key value props

Data ingestion/enrichment pipeline comes later.
