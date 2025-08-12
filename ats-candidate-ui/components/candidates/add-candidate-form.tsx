'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CheckCircle, Circle, ChevronRight, ChevronLeft, Upload, Linkedin, Mail, Phone, MapPin, Tag, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AddCandidateData } from '@/types'

const candidateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  notes: z.string().optional(),
  tags: z.array(z.string()),
  skills: z.array(z.string()),
})

type CandidateFormData = z.infer<typeof candidateSchema>

interface FormStep {
  id: string
  title: string
  description: string
}

const FORM_STEPS: FormStep[] = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Essential candidate details'
  },
  {
    id: 'contact',
    title: 'Contact & Profile',
    description: 'Contact information and professional links'
  },
  {
    id: 'details',
    title: 'Skills & Notes',
    description: 'Additional details and internal notes'
  }
]

interface AddCandidateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AddCandidateData) => void
}

export function AddCandidateForm({
  open,
  onOpenChange,
  onSubmit
}: AddCandidateFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set())
  const [skillInput, setSkillInput] = React.useState('')
  const [tagInput, setTagInput] = React.useState('')

  const form = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedinUrl: '',
      notes: '',
      tags: [],
      skills: [],
    },
  })

  const { register, formState: { errors }, watch, setValue, getValues, trigger } = form

  const watchedData = watch()

  // Auto-save effect (could be connected to localStorage or API)
  React.useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem('draft-candidate', JSON.stringify(value))
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // Load draft on mount
  React.useEffect(() => {
    if (open) {
      const draft = localStorage.getItem('draft-candidate')
      if (draft) {
        try {
          const draftData = JSON.parse(draft)
          Object.keys(draftData).forEach((key) => {
            setValue(key as keyof CandidateFormData, draftData[key])
          })
        } catch (e) {
          // Ignore invalid draft data
        }
      }
    }
  }, [open, setValue])

  const validateCurrentStep = async () => {
    const stepFields = getStepFields(currentStep)
    const isValid = await trigger(stepFields)
    
    if (isValid) {
      setCompletedSteps(prev => new Set(Array.from(prev).concat([currentStep])))
    }
    
    return isValid
  }

  const getStepFields = (stepIndex: number): (keyof CandidateFormData)[] => {
    switch (stepIndex) {
      case 0:
        return ['name', 'email']
      case 1:
        return ['phone', 'location', 'linkedinUrl']
      case 2:
        return ['notes', 'tags', 'skills']
      default:
        return []
    }
  }

  const nextStep = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const addSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = getValues('skills') || []
      if (!currentSkills.includes(skillInput.trim())) {
        setValue('skills', [...currentSkills, skillInput.trim()])
      }
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    const currentSkills = getValues('skills') || []
    setValue('skills', currentSkills.filter(s => s !== skill))
  }

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = getValues('tags') || []
      if (!currentTags.includes(tagInput.trim())) {
        setValue('tags', [...currentTags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    const currentTags = getValues('tags') || []
    setValue('tags', currentTags.filter(t => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const isValid = await trigger()
    
    if (isValid) {
      const data = getValues()
      onSubmit(data)
      localStorage.removeItem('draft-candidate')
      form.reset()
      setCurrentStep(0)
      setCompletedSteps(new Set())
      onOpenChange(false)
    }
  }

  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.has(stepIndex)) return 'completed'
    if (stepIndex === currentStep) return 'active'
    return 'pending'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Candidate</DialogTitle>
          <DialogDescription>
            Fill in the candidate details. Your progress is automatically saved.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between py-4">
          {FORM_STEPS.map((step, index) => {
            const status = getStepStatus(index)
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                      status === 'completed' && 'bg-primary border-primary text-primary-foreground',
                      status === 'active' && 'border-primary text-primary bg-background',
                      status === 'pending' && 'border-muted-foreground/25 text-muted-foreground'
                    )}
                  >
                    {status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={cn(
                      'text-sm font-medium',
                      status === 'active' ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < FORM_STEPS.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground mx-4 mt-[-20px]" />
                )}
              </div>
            )
          })}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="space-y-6 py-4">
            {/* Step 1: Basic Information */}
            {currentStep === 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    {...register('name')}
                    placeholder="Enter full name"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...register('email')}
                      placeholder="candidate@email.com"
                      className={cn('pl-10', errors.email ? 'border-destructive' : '')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Tip:</strong> Use the candidate's professional email address for better deliverability.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Profile */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...register('phone')}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...register('location')}
                      placeholder="San Francisco, CA"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn Profile</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...register('linkedinUrl')}
                      placeholder="https://linkedin.com/in/candidate"
                      className={cn('pl-10', errors.linkedinUrl ? 'border-destructive' : '')}
                    />
                  </div>
                  {errors.linkedinUrl && (
                    <p className="text-sm text-destructive">{errors.linkedinUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Resume Upload</label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload resume or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, DOCX up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Skills & Notes */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Skills</label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} variant="outline">
                      Add
                    </Button>
                  </div>
                  {watchedData.skills && watchedData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchedData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  {watchedData.tags && watchedData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchedData.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:bg-accent rounded-full p-0.5"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Internal Notes</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <textarea
                      {...register('notes')}
                      placeholder="Add any internal notes about this candidate..."
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {FORM_STEPS.length}
            </div>

            {currentStep === FORM_STEPS.length - 1 ? (
              <Button type="submit" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Add Candidate
              </Button>
            ) : (
              <Button type="button" onClick={nextStep} className="gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}