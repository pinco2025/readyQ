'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Search, Filter } from "lucide-react"

interface TaskFiltersProps {
  viewMode: 'priority' | 'status'
}

export function TaskFilters({ viewMode }: TaskFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [isPersonal, setIsPersonal] = useState<boolean | null>(null)

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedPriority("all")
    setIsPersonal(null)
  }

  const hasActiveFilters = searchTerm || selectedCategory !== "all" || selectedPriority !== "all" || isPersonal !== null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-[#6B7280] hover:text-[#E5E7EB]"
          >
            <X size={16} className="mr-2" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280]" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#1A1A1A] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="bg-[#1A1A1A] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-[#374151]">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="work">Work</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="learning">Learning</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="bg-[#1A1A1A] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-[#374151]">
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>

        {/* Personal/Work Filter */}
        <Select 
          value={isPersonal === null ? "all" : isPersonal ? "personal" : "work"} 
          onValueChange={(value) => {
            if (value === "all") setIsPersonal(null)
            else setIsPersonal(value === "personal")
          }}
        >
          <SelectTrigger className="bg-[#1A1A1A] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20">
            <SelectValue placeholder="All Tasks" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-[#374151]">
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="personal">Personal Only</SelectItem>
            <SelectItem value="work">Work Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {searchTerm && (
            <Badge variant="secondary" className="bg-[#374151] text-[#E5E7EB]">
              Search: "{searchTerm}"
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="h-4 w-4 p-0 ml-2 hover:bg-[#6B7280]/20"
              >
                <X size={12} />
              </Button>
            </Badge>
          )}
          
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="bg-[#374151] text-[#E5E7EB]">
              Category: {selectedCategory}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="h-4 w-4 p-0 ml-2 hover:bg-[#6B7280]/20"
              >
                <X size={12} />
              </Button>
            </Badge>
          )}
          
          {selectedPriority !== "all" && (
            <Badge variant="secondary" className="bg-[#374151] text-[#E5E7EB]">
              Priority: {selectedPriority}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPriority("all")}
                className="h-4 w-4 p-0 ml-2 hover:bg-[#6B7280]/20"
              >
                <X size={12} />
              </Button>
            </Badge>
          )}
          
          {isPersonal !== null && (
            <Badge variant="secondary" className="bg-[#374151] text-[#E5E7EB]">
              Type: {isPersonal ? "Personal" : "Work"}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPersonal(null)}
                className="h-4 w-4 p-0 ml-2 hover:bg-[#6B7280]/20"
              >
                <X size={12} />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
