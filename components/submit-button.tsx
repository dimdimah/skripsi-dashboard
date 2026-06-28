import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SubmitButtonProps extends ButtonProps {
  loading: boolean
}

export function SubmitButton({ loading, disabled, children, className, ...props }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled || loading}
      className={cn('relative', className)}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </span>
      )}
      <span className={cn(loading && 'invisible')}>
        {children}
      </span>
    </Button>
  )
}
