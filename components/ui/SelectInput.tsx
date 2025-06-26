
import React from 'react';

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string | number; label: string }[];
  error?: string;
  containerClassName?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, id, options, error, containerClassName = 'mb-4', className, ...props }) => {
  return (
    <div className={containerClassName}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={id}
        className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-bioren-blue-light focus:border-bioren-blue-light sm:text-sm ${className}`}
        {...props}
      >
        <option value="" disabled>{props.value === "" ? `Seleccione ${label.toLowerCase()}`: `Seleccione ${label.toLowerCase()}`}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default SelectInput;