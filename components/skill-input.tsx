'use client'

import { useState, useRef, useEffect } from 'react'

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby',
  'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte', 'jQuery',
  'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails',
  'HTML', 'CSS', 'SASS', 'Tailwind CSS', 'Bootstrap',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Firebase', 'Supabase',
  'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'CI/CD',
  'Git', 'GitHub', 'GitLab', 'Bitbucket',
  'Figma', 'Adobe XD', 'Photoshop', 'Illustrator',
  'REST API', 'GraphQL', 'WebSocket',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Analysis',
  'Project Management', 'Agile', 'Scrum', 'JIRA', 'Trello',
  'Communication', 'Leadership', 'Teamwork', 'Problem Solving',
]

interface SkillInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SkillInput({ value, onChange, placeholder }: SkillInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentSkills = inputValue
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)

  const filteredSuggestions = COMMON_SKILLS.filter(skill => {
    const skillLower = skill.toLowerCase()
    const matchesInput = skillLower.includes(inputValue.split(',').pop()?.trim().toLowerCase() || '')
    const notAlreadyAdded = !currentSkills.includes(skillLower)
    return matchesInput && notAlreadyAdded
  }).slice(0, 8)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)

    const lastSkill = newValue.split(',').pop()?.trim() || ''
    if (lastSkill.length > 0) {
      setSuggestions(filteredSuggestions)
      setShowSuggestions(true)
      setSelectedIndex(-1)
    } else {
      setShowSuggestions(false)
    }
  }

  function handleSelect(skill: string) {
    const parts = inputValue.split(',').map(s => s.trim())
    parts[parts.length - 1] = skill
    const newValue = parts.join(', ') + ', '
    setInputValue(newValue)
    onChange(newValue)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          const lastSkill = inputValue.split(',').pop()?.trim() || ''
          if (lastSkill.length > 0) {
            setSuggestions(filteredSuggestions)
            setShowSuggestions(true)
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-md border border-amikom-hairline bg-amikom-canvas px-3.5 py-2.5 text-sm text-amikom-ink placeholder-amikom-ink/30 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
          {suggestions.map((skill, index) => (
            <button
              key={skill}
              type="button"
              onClick={() => handleSelect(skill)}
              className={`w-full px-3.5 py-2 text-left text-sm transition-colors ${
                index === selectedIndex
                  ? 'bg-amikom-purple/10 text-amikom-purple'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
