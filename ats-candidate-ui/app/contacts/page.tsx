'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Building2,
  Users,
  Calendar,
  LinkedinIcon,
  Eye,
  Edit,
  MoreHorizontal,
  MessageCircle,
  UserCheck,
  Briefcase
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockContacts, getCurrentUser, Contact } from '@/lib/mock-data'

export default function ContactsPage() {
  const currentUser = getCurrentUser()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<'all' | 'employer' | 'agency' | 'candidate' | 'vendor'>('all')
  const [contacts, setContacts] = React.useState<Contact[]>(mockContacts)

  const getFilteredContacts = () => {
    let filteredContacts = contacts

    // Type filtering
    if (typeFilter !== 'all') {
      filteredContacts = filteredContacts.filter(contact => contact.type === typeFilter)
    }

    // Search filtering
    if (searchQuery) {
      filteredContacts = filteredContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filteredContacts.sort((a, b) => b.lastContact.getTime() - a.lastContact.getTime())
  }

  const filteredContacts = getFilteredContacts()

  const formatLastContact = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'employer':
        return 'text-blue-700 bg-blue-100'
      case 'agency':
        return 'text-purple-700 bg-purple-100'
      case 'candidate':
        return 'text-green-700 bg-green-100'
      case 'vendor':
        return 'text-orange-700 bg-orange-100'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'employer':
        return <Building2 className="h-4 w-4" />
      case 'agency':
        return <Users className="h-4 w-4" />
      case 'candidate':
        return <UserCheck className="h-4 w-4" />
      case 'vendor':
        return <Briefcase className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  // Contact stats
  const contactStats = [
    {
      label: 'Total Contacts',
      value: filteredContacts.length,
      icon: Users
    },
    {
      label: 'Employers',
      value: contacts.filter(c => c.type === 'employer').length,
      icon: Building2
    },
    {
      label: 'Agencies',
      value: contacts.filter(c => c.type === 'agency').length,
      icon: Users
    },
    {
      label: 'Candidates',
      value: contacts.filter(c => c.type === 'candidate').length,
      icon: UserCheck
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your professional network and relationships
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {contactStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          {(['all', 'employer', 'agency', 'candidate', 'vendor'] as const).map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTypeFilter(type)}
              className="capitalize gap-1"
            >
              {type !== 'all' && getTypeIcon(type)}
              {type}
            </Button>
          ))}
        </div>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No contacts found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Try adjusting your search terms or filters'
                    : 'Get started by adding your first contact'
                  }
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{contact.name}</CardTitle>
                          <Badge 
                            variant="secondary" 
                            className={getTypeColor(contact.type)}
                          >
                            {contact.type}
                          </Badge>
                        </div>
                        <CardDescription>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{contact.position}</span>
                              <span className="text-muted-foreground">at</span>
                              <span>{contact.company}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              Last contact: {formatLastContact(contact.lastContact)}
                            </div>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Contact
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`mailto:${contact.email}`}
                          className="text-primary hover:underline"
                        >
                          {contact.email}
                        </a>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={`tel:${contact.phone}`}
                            className="text-primary hover:underline"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      )}
                      {contact.linkedinUrl && (
                        <div className="flex items-center gap-2 text-sm">
                          <LinkedinIcon className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={contact.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <div className="text-sm font-medium mb-2">Tags:</div>
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {contact.notes && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="text-sm font-medium mb-1">Notes:</div>
                        <p className="text-sm text-muted-foreground">{contact.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </Button>
                      {contact.phone && (
                        <Button variant="outline" size="sm">
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contact Activity</CardTitle>
          <CardDescription>
            Your recent interactions and upcoming follow-ups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Sent email to John Smith</span>
              <span className="text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-green-500" />
              <span className="font-medium">Called Sarah Johnson</span>
              <span className="text-muted-foreground">1 day ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Follow up with Emily Davis</span>
              <span className="text-muted-foreground">Due tomorrow</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination placeholder */}
      {filteredContacts.length > 20 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline">Load More Contacts</Button>
        </div>
      )}
    </div>
  )
}