'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  Database,
  Webhook,
  Key,
  Users,
  Building2,
  Mail,
  Phone,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Settings as SettingsIcon,
  Zap,
  Target,
  Activity
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getCurrentUser } from '@/lib/mock-data'

interface SettingSection {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
}

export default function SettingsPage() {
  const currentUser = getCurrentUser()
  const [activeSection, setActiveSection] = React.useState('profile')
  const [showApiKeys, setShowApiKeys] = React.useState<Record<string, boolean>>({})

  const settingSections: SettingSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      description: 'Manage your personal information and preferences',
      icon: User
    },
    {
      id: 'organization',
      title: 'Organization',
      description: 'Organization settings and team management',
      icon: Building2
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure alerts and communication preferences',
      icon: Bell
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Password, authentication, and security settings',
      icon: Shield
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Connect with external tools and services',
      icon: Webhook
    },
    {
      id: 'api',
      title: 'API & Access',
      description: 'API keys and developer access management',
      icon: Key
    }
  ]

  // Add AI-specific sections for prototype role
  if (currentUser.role === 'platform_prototype') {
    settingSections.push(
      {
        id: 'ai-config',
        title: 'AI Configuration',
        description: 'Advanced AI agent settings and customization',
        icon: Zap
      },
      {
        id: 'matching-rules',
        title: 'Matching Rules',
        description: 'Configure AI matching algorithms and criteria',
        icon: Target
      },
      {
        id: 'system-health',
        title: 'System Health',
        description: 'Platform monitoring and performance settings',
        icon: Activity
      }
    )
  }

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }))
  }

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" defaultValue="Alex" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" defaultValue="Platform" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={currentUser.email} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" defaultValue="+1 (555) 123-4567" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" defaultValue="America/Los_Angeles" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input id="language" defaultValue="English (US)" />
          </div>
        </div>
      </div>
    </div>
  )

  const renderOrganizationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input id="orgName" defaultValue={currentUser.organizationName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgType">Organization Type</Label>
            <Input id="orgType" defaultValue="Technology Platform" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgSize">Company Size</Label>
            <Input id="orgSize" defaultValue="50-200 employees" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgWebsite">Website</Label>
            <Input id="orgWebsite" defaultValue="https://atsplatform.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgIndustry">Industry</Label>
            <Input id="orgIndustry" defaultValue="Human Resources Technology" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgLocation">Location</Label>
            <Input id="orgLocation" defaultValue="San Francisco, CA" />
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Email Notifications</h4>
            <p className="text-sm text-muted-foreground">Receive updates via email</p>
          </div>
          <Button variant="outline" size="sm">Configure</Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Push Notifications</h4>
            <p className="text-sm text-muted-foreground">Browser and mobile notifications</p>
          </div>
          <Button variant="outline" size="sm">Configure</Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">SMS Alerts</h4>
            <p className="text-sm text-muted-foreground">Critical updates via text message</p>
          </div>
          <Button variant="outline" size="sm">Configure</Button>
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Change Password</h4>
            <p className="text-sm text-muted-foreground">Update your account password</p>
          </div>
          <Button variant="outline" size="sm">Change</Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Two-Factor Authentication</h4>
            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
          </div>
          <Badge variant="outline">Disabled</Badge>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Session Management</h4>
            <p className="text-sm text-muted-foreground">Manage active sessions</p>
          </div>
          <Button variant="outline" size="sm">Manage</Button>
        </div>
      </div>
    </div>
  )

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        {[
          { name: 'LinkedIn', status: 'Connected', icon: '🔗' },
          { name: 'Google Calendar', status: 'Connected', icon: '📅' },
          { name: 'Slack', status: 'Disconnected', icon: '💬' },
          { name: 'Zoom', status: 'Connected', icon: '🎥' },
          { name: 'GitHub', status: 'Disconnected', icon: '📦' },
          { name: 'Greenhouse', status: 'Disconnected', icon: '🌱' }
        ].map((integration, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-xl">{integration.icon}</span>
              <div>
                <h4 className="font-medium">{integration.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {integration.name} integration for recruiting workflow
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={integration.status === 'Connected' ? 'default' : 'outline'}
              >
                {integration.status}
              </Badge>
              <Button variant="outline" size="sm">
                {integration.status === 'Connected' ? 'Configure' : 'Connect'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {[
          { name: 'Production API Key', key: 'pk_live_1234567890abcdef', created: '2024-01-15' },
          { name: 'Development API Key', key: 'pk_test_abcdef1234567890', created: '2024-02-01' },
          { name: 'Webhook Secret', key: 'whsec_1234567890abcdef', created: '2024-01-20' }
        ].map((apiKey, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium">{apiKey.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {showApiKeys[apiKey.name] ? apiKey.key : '••••••••••••••••'}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleApiKeyVisibility(apiKey.name)}
                >
                  {showApiKeys[apiKey.name] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Created on {apiKey.created}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Rotate</Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Generate New Key
        </Button>
      </div>
    </div>
  )

  const renderAIConfigSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="aiModel">AI Model Version</Label>
            <Input id="aiModel" defaultValue="GPT-4-Turbo-Preview" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confidence">Minimum Confidence Threshold</Label>
            <Input id="confidence" defaultValue="85%" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxTokens">Max Tokens per Request</Label>
            <Input id="maxTokens" defaultValue="4096" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature">AI Temperature</Label>
            <Input id="temperature" defaultValue="0.3" />
          </div>
        </div>
      </div>
    </div>
  )

  const getCurrentSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings()
      case 'organization':
        return renderOrganizationSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'security':
        return renderSecuritySettings()
      case 'integrations':
        return renderIntegrationsSettings()
      case 'api':
        return renderApiSettings()
      case 'ai-config':
        return renderAIConfigSettings()
      case 'matching-rules':
        return <div className="text-center py-10 text-muted-foreground">Matching Rules configuration coming soon</div>
      case 'system-health':
        return <div className="text-center py-10 text-muted-foreground">System Health monitoring coming soon</div>
      default:
        return renderProfileSettings()
    }
  }

  const currentSection = settingSections.find(section => section.id === activeSection)

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, organization, and platform preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Choose a category to configure
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {settingSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 rounded-lg transition-colors ${
                      activeSection === section.id ? 'bg-muted' : ''
                    }`}
                  >
                    <section.icon className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">{section.title}</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentSection?.icon && <currentSection.icon className="h-5 w-5" />}
                {currentSection?.title}
              </CardTitle>
              <CardDescription>
                {currentSection?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getCurrentSectionContent()}
              
              {/* Save Button */}
              <div className="flex justify-end mt-6 pt-6 border-t">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Usage Statistics for Platform Prototype */}
      {currentUser.role === 'platform_prototype' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Platform Usage Statistics</CardTitle>
            <CardDescription>
              Current system utilization and limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">1,247</div>
                <div className="text-sm text-muted-foreground">API Calls (Monthly)</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">98.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">2.3GB</div>
                <div className="text-sm text-muted-foreground">Storage Used</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">156ms</div>
                <div className="text-sm text-muted-foreground">Avg Response Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}