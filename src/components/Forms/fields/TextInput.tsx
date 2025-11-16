// React import removed: not needed with the new JSX transform
import type { UseFormRegister } from 'react-hook-form'

type Props = {
  name: string
  label?: string
  placeholder?: string
  register: UseFormRegister<any>
  type?: string
  className?: string
}

export default function TextInput({ name, label, placeholder, register, type = 'text', className = '' }: Props) {
  return (
    <div className="flex flex-col">
      {label && <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className={`block w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-200 p-2 ${className}`}
      />
    </div>
  )
}
