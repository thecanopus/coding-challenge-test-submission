import React from "react";

import Address from "@/components/Address/Address";
import AddressBook from "@/components/AddressBook/AddressBook";
import Button from "@/components/Button/Button";
import InputText from "@/components/InputText/InputText";
import Radio from "@/components/Radio/Radio";
import Section from "@/components/Section/Section";
import useAddressBook from "@/hooks/useAddressBook";
import { useFormFields } from "@/hooks/useFormFields";

import styles from "./App.module.css";
import { Address as AddressType } from "./types";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import transformAddress from "./core/models/address";
import Form from "@/components/Form/Form";

function App() {
  /**
   * Form fields states
   * TODO: **DONE** Write a custom hook to set form fields in a more generic way:
   * - Hook must expose an onChange handler to be used by all <InputText /> and <Radio /> components
   * - Hook must expose all text form field values, like so: { postCode: '', houseNumber: '', ...etc }
   * - Remove all individual React.useState
   * - Remove all individual onChange handlers, like handlePostCodeChange for example
   */
  const { formFields, onChange, clearAllFields } = useFormFields();
  
  /**
   * Results states
   */
  const [error, setError] = React.useState<undefined | string>(undefined);
  const [isLoading, setIsLoading] = React.useState(false);
  const [addresses, setAddresses] = React.useState<AddressType[]>([]);
  /**
   * Redux actions
   */
  const { addAddress } = useAddressBook();

  /** TODO: **DONE** Fetch addresses based on houseNumber and postCode using the local BE api
   * - Example URL of API: ${process.env.NEXT_PUBLIC_URL}/api/getAddresses?postcode=1345&streetnumber=350
   * - Ensure you provide a BASE URL for api endpoint for grading purposes!
   * - Handle errors if they occur
   * - Handle successful response by updating the `addresses` in the state using `setAddresses`
   * - Make sure to add the houseNumber to each found address in the response using `transformAddress()` function
   * - Ensure to clear previous search results on each click
   * - Bonus: Add a loading state in the UI while fetching addresses
   */
  const handleAddressSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    setAddresses([]);
    setError(undefined);

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/getAddresses?postcode=${formFields.postCode}&streetnumber=${formFields.houseNumber}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }
      
      const data = await response.json();
      
      if (data.status === 'ok') {
        const transformedAddresses = data.details.map((address: any, index: number) => {
          const transformed = transformAddress(address);
          return {
            ...transformed,
            houseNumber: index + 1
          };
        });
        
        setAddresses(transformedAddresses);
      } else {
        setError(data.errormessage || 'No results found');
      }
    } catch (error) {
      setError('Failed to fetch addresses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /** TODO: **DONE** Add basic validation to ensure first name and last name fields aren't empty
   * Use the following error message setError("First name and last name fields mandatory!")
   */
  const handlePersonSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formFields.firstName || !formFields.lastName) {
      setError("First name and last name fields mandatory!")
      return;
    }

    if (!formFields.selectedAddress || !addresses.length) {
      setError(
        "No address selected, try to select an address or find one if you haven't"
      );
      return;
    }

    const foundAddress = addresses.find(
      (address) => address.id === formFields.selectedAddress
    );

    if (!foundAddress) {
      setError("Selected address not found");
      return;
    }

    addAddress({ ...foundAddress, firstName: formFields.firstName, lastName: formFields.lastName });
  };

  
  /** 
   * Form builders
  */
  const findAddressForm = {
    loading: isLoading,
    label: "🏠 Find an address",
    formEntries: [
      {
        name: 'postCode',
        placeholder: 'Post Code',
        extraProps: {
          onChange: onChange,
          value: formFields.postCode
        }
      },
      {
        name: 'houseNumber',
        placeholder: 'House Number',
        extraProps: {
          onChange: onChange,
          value: formFields.houseNumber
        }
      },
    ],
    submitText:"Find",
    onFormSubmit: handleAddressSubmit
  }

  
  const addAddressForm = {
    loading: isLoading,
    label: "✏️ Add personal info to address",
    formEntries: [
      {
        name: 'firstName',
        placeholder: 'First name',
        extraProps: {
          onChange: onChange,
          value: formFields.firstName
        }
      },
      {
        name: 'lastName',
        placeholder: 'Last name',
        extraProps: {
          onChange: onChange,
          value: formFields.lastName
        }
      },
    ],
    submitText:"Add to addressbook",
    onFormSubmit: handlePersonSubmit
  }

  return (
    <main>
      <Section>
        <h1>
          Create your own address book!
          <br />
          <small>
            Enter an address by postcode add personal info and done! 👏
          </small>
        </h1>
        {/* TODO: **DONE** Create generic <Form /> component to display form rows, legend and a submit button  */}
        <Form {...findAddressForm} />
        {addresses.length > 0 &&
          addresses.map((address) => {
            return (
              <Radio
                name="selectedAddress"
                id={address.id}
                key={address.id}
                onChange={onChange}
              >
                <Address {...address} />
              </Radio>
            );
          })}
        {/* TODO: **DONE** Create generic <Form /> component to display form rows, legend and a submit button  */}
        {formFields.selectedAddress && (
          <Form {...addAddressForm} />
        )}

        {/* TODO: **DONE** Create an <ErrorMessage /> component for displaying an error message */}
        <ErrorMessage error={error} />

        {/* TODO: **DONE** Add a button to clear all form fields. 
        Button must look different from the default primary button, see design. 
        Button text name must be "Clear all fields"
        On Click, it must clear all form fields, remove all search results and clear all prior
        error messages
        */}
        <Button onClick={clearAllFields} variant="secondary">Clear all fields</Button>
      </Section>

      <Section variant="dark">
        <AddressBook />
      </Section>
    </main>
  );
}

export default App;
