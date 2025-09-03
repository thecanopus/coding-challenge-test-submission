import { useState, useCallback, ChangeEvent } from 'react';

interface FormFields {
  postCode: string;
  houseNumber: string;
  firstName: string;
  lastName: string;
  selectedAddress: string;
}

export const useFormFields = () => {
  const [formFields, setFormFields] = useState<FormFields>({
    postCode: '',
    houseNumber: '',
    firstName: '',
    lastName: '',
    selectedAddress: '',
  });

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormFields(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const clearAllFields = useCallback(() => {
    setFormFields({
      postCode: '',
      houseNumber: '',
      firstName: '',
      lastName: '',
      selectedAddress: '',
    });
  }, []);

  return {
    formFields,
    onChange,
    clearAllFields,
  };
}; 