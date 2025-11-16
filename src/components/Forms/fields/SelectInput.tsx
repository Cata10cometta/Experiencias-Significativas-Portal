// React import removed: not needed with the new JSX transform
import type { UseFormRegister } from 'react-hook-form'

type Option = { label: string; value: string | number }

type Props = {
  name: string
  label?: string
  register: UseFormRegister<any>
  options: Option[]
  className?: string
}

export default function SelectInput({ name, label, register, options, className = '' }: Props) {
  return (
    <div className="flex flex-col">
      {label && <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select {...register(name)} className={`block w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-200 p-2 ${className}`}>
        <option value="">Seleccione</option>
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
