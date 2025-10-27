# Bullseye Revenue - GTM Intelligence Dashboard

A clean, fast, and professional view-only GTM intelligence dashboard built with Next.js, Tailwind CSS, and Supabase.

## Features

- **Clean Table View**: Display all leads from your Supabase `leads_view`
- **Text Search**: Filter by name, company, title, or email
- **Column Sorting**: Click any column header to sort ascending/descending
- **Column Visibility**: Show/hide columns using the dropdown menu
- **Pagination**: Browse through leads 50 at a time
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **ShadCN UI Components**
- **Supabase** (PostgreSQL backend)
- **Vercel** (deployment platform)

## Prerequisites

1. A Supabase project with the following tables:
   - `companies` table
   - `people` table
   - `leads_view` database view

2. Node.js 18+ installed

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these values in your Supabase project settings under **API**.

### 3. Database Setup

Run the following SQL in your Supabase SQL Editor to create the required tables and view:

```sql
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  company_domain TEXT NULL,
  company_linkedin_url TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- People table
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  first_name TEXT NULL,
  last_name TEXT NULL,
  person_linkedin_url TEXT NULL,
  company_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  work_email TEXT NULL,
  phone_number TEXT NULL,
  job_title TEXT NULL,
  email_status TEXT NULL,
  company_linkedin_url TEXT NULL,
  company_name TEXT NULL,
  company_domain TEXT NULL,
  CONSTRAINT people_company_id_fkey FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_people_company_id ON people(company_id);

DROP TRIGGER IF EXISTS update_people_updated_at ON people;
CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Leads view
CREATE OR REPLACE VIEW leads_view AS
SELECT
  id,
  full_name,
  first_name,
  last_name,
  work_email,
  job_title,
  company_name,
  company_domain,
  company_linkedin_url,
  person_linkedin_url,
  email_status,
  created_at
FROM people
WHERE work_email IS NOT NULL;
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### 5. Build for Production

```bash
npm run build
npm start
```

## Deploy to Vercel

### Option 1: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page (leads dashboard)
├── components/
│   ├── leads-table.tsx       # Main leads table component
│   └── ui/                   # ShadCN UI components
│       ├── button.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       └── table.tsx
├── lib/
│   ├── supabase.ts           # Supabase client setup
│   └── utils.ts              # Utility functions (cn)
└── public/                   # Static assets
```

## Features Breakdown

### Text Search
Searches across:
- Full name
- Company name
- Job title
- Work email

### Column Visibility
Toggle visibility for:
- Name
- Email
- Title
- Company
- Domain
- Email Status
- LinkedIn (Person)
- LinkedIn (Company)

### Sorting
Click any column header to sort. Click again to reverse order.

### Pagination
- 50 leads per page
- Previous/Next navigation
- Shows current page and total pages

## Development Notes

### Adding New Columns

1. Update the `Lead` type in `lib/supabase.ts`
2. Update `leads_view` SQL to include the new column
3. Add the column to `visibleColumns` state in `components/leads-table.tsx`
4. Add the column to the dropdown menu
5. Add the table header and cell rendering

### Customizing Styles

All styles use Tailwind CSS. The color scheme is defined in:
- `app/globals.css` - CSS variables for light/dark mode
- `tailwind.config.ts` - Tailwind theme configuration

## Troubleshooting

### "Supabase client not configured" warning

Make sure your `.env.local` file exists and contains valid Supabase credentials.

### No leads showing

1. Check that `leads_view` exists in your Supabase database
2. Verify that you have data in the `people` table with non-null `work_email` values
3. Check the browser console for error messages

### Build errors

Run `npm run build` to check for TypeScript errors before deploying.

## License

MIT

## Support

For issues or questions, please contact your development team.
