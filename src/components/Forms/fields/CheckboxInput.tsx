// React import removed: not needed with the new JSX transform
import type { UseFormRegister } from 'react-hook-form'

type Props = {
  name: string
  label?: string
  register: UseFormRegister<any>
  className?: string
}

export default function CheckboxInput({ name, label, register, className = '' }: Props) {
  return (
    <label className={`flex items-center space-x-2 ${className}`}>
      <input {...register(name)} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}
