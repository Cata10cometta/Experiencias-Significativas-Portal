import React from "react";

interface FormSectionProps {
  children: React.ReactNode;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({ children, className = "" }) => {
  return (
    <div className={`w-full px-4 md:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default FormSection;
