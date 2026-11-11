import Image from 'next/image'
import { cn } from '@/lib/utils'

export function BrandLogo({
  size = 40,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg border bg-white p-1',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/logo-cvg.png"
        alt="CVG Ferrominera Orinoco"
        width={size}
        height={size}
        className="h-full w-full object-contain"
        priority
      />
    </span>
  )
}
