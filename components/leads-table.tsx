'use client'

import { useEffect, useState } from 'react'
import { supabase, type Lead } from '@/lib/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowUpDown, ChevronLeft, ChevronRight, Columns3 } from 'lucide-react'

type SortField = keyof Lead | null
type SortOrder = 'asc' | 'desc'

const ITEMS_PER_PAGE = 50

export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    full_name: true,
    work_email: true,
    job_title: true,
    company_name: true,
    company_domain: true,
    email_status: true,
    person_linkedin_url: true,
    company_linkedin_url: true,
  })

  // Fetch leads from Supabase
  useEffect(() => {
    async function fetchLeads() {
      setLoading(true)
      try {
        if (!supabase) {
          console.warn('Supabase client not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
          setLeads([])
          setFilteredLeads([])
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('leads_view')
          .select('*')

        if (error) throw error
        setLeads(data || [])
        setFilteredLeads(data || [])
      } catch (error) {
        console.error('Error fetching leads:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [])

  // Filter and sort leads
  useEffect(() => {
    let result = [...leads]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (lead) =>
          lead.full_name?.toLowerCase().includes(query) ||
          lead.company_name?.toLowerCase().includes(query) ||
          lead.job_title?.toLowerCase().includes(query) ||
          lead.work_email?.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]

        if (aVal === null) return 1
        if (bVal === null) return -1

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    setFilteredLeads(result)
    setCurrentPage(1) // Reset to first page on filter/sort change
  }, [leads, searchQuery, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentLeads = filteredLeads.slice(startIndex, endIndex)

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading leads...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
        <Input
          placeholder="Search by name, company, title, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns3 className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuCheckboxItem
              checked={visibleColumns.full_name}
              onCheckedChange={() => toggleColumn('full_name')}
            >
              Name
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.work_email}
              onCheckedChange={() => toggleColumn('work_email')}
            >
              Email
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.job_title}
              onCheckedChange={() => toggleColumn('job_title')}
            >
              Title
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.company_name}
              onCheckedChange={() => toggleColumn('company_name')}
            >
              Company
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.company_domain}
              onCheckedChange={() => toggleColumn('company_domain')}
            >
              Domain
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.email_status}
              onCheckedChange={() => toggleColumn('email_status')}
            >
              Email Status
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.person_linkedin_url}
              onCheckedChange={() => toggleColumn('person_linkedin_url')}
            >
              LinkedIn (Person)
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.company_linkedin_url}
              onCheckedChange={() => toggleColumn('company_linkedin_url')}
            >
              LinkedIn (Company)
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.full_name && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('full_name')}
                    className="-ml-3"
                  >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.work_email && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('work_email')}
                    className="-ml-3"
                  >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.job_title && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('job_title')}
                    className="-ml-3"
                  >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.company_name && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('company_name')}
                    className="-ml-3"
                  >
                    Company
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.company_domain && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('company_domain')}
                    className="-ml-3"
                  >
                    Domain
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.email_status && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('email_status')}
                    className="-ml-3"
                  >
                    Email Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.person_linkedin_url && (
                <TableHead>LinkedIn (Person)</TableHead>
              )}
              {visibleColumns.company_linkedin_url && (
                <TableHead>LinkedIn (Company)</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentLeads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={Object.values(visibleColumns).filter(Boolean).length}
                  className="text-center py-8 text-muted-foreground"
                >
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              currentLeads.map((lead) => (
                <TableRow key={lead.id}>
                  {visibleColumns.full_name && (
                    <TableCell className="font-medium">
                      {lead.full_name || '-'}
                    </TableCell>
                  )}
                  {visibleColumns.work_email && (
                    <TableCell>{lead.work_email}</TableCell>
                  )}
                  {visibleColumns.job_title && (
                    <TableCell>{lead.job_title || '-'}</TableCell>
                  )}
                  {visibleColumns.company_name && (
                    <TableCell>{lead.company_name || '-'}</TableCell>
                  )}
                  {visibleColumns.company_domain && (
                    <TableCell className="text-muted-foreground">
                      {lead.company_domain || '-'}
                    </TableCell>
                  )}
                  {visibleColumns.email_status && (
                    <TableCell>
                      {lead.email_status ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          lead.email_status.toLowerCase() === 'valid'
                            ? 'bg-green-100 text-green-800'
                            : lead.email_status.toLowerCase() === 'invalid'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.email_status}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.person_linkedin_url && (
                    <TableCell>
                      {lead.person_linkedin_url ? (
                        <a
                          href={lead.person_linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.company_linkedin_url && (
                    <TableCell>
                      {lead.company_linkedin_url ? (
                        <a
                          href={lead.company_linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length} leads
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
