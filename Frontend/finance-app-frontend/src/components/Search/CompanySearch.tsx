import { useEffect, useId, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from '../../router'
import { useCompanySearch, CompanySearchResult } from '../../api/account'
import CompanyLogo from '../ui/CompanyLogo'
import { cn } from '../../scripts/utils'

const DEBOUNCE_MS = 200

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])
  return debounced
}

/** Search box with a listbox of matching companies (ticker or name). */
export default function CompanySearch({ className }: { className?: string }) {
  const navigate = useNavigate()
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const query = useDebounced(term, DEBOUNCE_MS)
  const { data, isFetching, isError } = useCompanySearch(query)
  const hasTerm = term.trim().length > 0
  const results: CompanySearchResult[] = hasTerm ? data ?? [] : []
  const showList = open && hasTerm

  useEffect(() => setActive(0), [query])

  // "/" focuses the search, like most finance sites
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) && !target.isContentEditable) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const choose = (company: CompanySearchResult) => {
    setTerm('')
    setOpen(false)
    inputRef.current?.blur()
    navigate('/company/:id', { params: { id: String(company.id) } })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      if (results.length) setActive((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length)
    } else if (e.key === 'Enter' && showList && results[active]) {
      e.preventDefault()
      choose(results[active])
    } else if (e.key === 'Escape') {
      if (term) setTerm('')
      else inputRef.current?.blur()
      setOpen(false)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <label htmlFor={`${listId}-input`} className="sr-only">
        Search companies
      </label>
      <FontAwesomeIcon
        icon={isFetching && hasTerm ? faSpinner : faMagnifyingGlass}
        spin={isFetching && hasTerm}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-subtle"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        id={`${listId}-input`}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${results[active].id}` : undefined}
        autoComplete="off"
        spellCheck={false}
        placeholder="Search companies or tickers"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        // Delay so a click on a result lands before the list closes
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        className="h-9 w-full rounded-lg border border-line bg-bg/60 pl-8 pr-8 text-sm text-fg placeholder:text-subtle transition-colors focus:border-accent/60 focus:bg-raised focus:outline-none focus-visible:outline-none"
      />
      {term ? (
        <button
          type="button"
          onClick={() => {
            setTerm('')
            inputRef.current?.focus()
          }}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-subtle hover:bg-raised hover:text-fg"
        >
          <FontAwesomeIcon icon={faXmark} className="text-xs" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 text-[10px] font-medium text-subtle sm:block">
          /
        </kbd>
      )}

      {showList && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-line-strong bg-surface shadow-pop animate-fade-in">
          <ul id={listId} role="listbox" aria-label="Companies" className="max-h-80 overflow-y-auto py-1">
            {results.map((company, index) => (
              <li
                key={company.id}
                id={`${listId}-${company.id}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(company)}
                onMouseEnter={() => setActive(index)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 px-3 py-2',
                  index === active ? 'bg-raised' : 'hover:bg-raised/60',
                )}
              >
                <CompanyLogo code={company.code} color={company.color} size="xs" />
                <span className="w-14 shrink-0 text-[13px] font-semibold text-fg">{company.code}</span>
                <span className="truncate text-[13px] text-muted">{company.name}</span>
              </li>
            ))}
          </ul>
          {results.length === 0 && (
            <p className="px-3 py-3 text-[13px] text-muted" role="status">
              {isError ? 'Search is unavailable right now.' : isFetching || query !== term ? 'Searching…' : `No companies match “${term.trim()}”.`}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
