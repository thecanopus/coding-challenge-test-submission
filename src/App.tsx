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
        {/* TODO: Create generic <Form /> component to display form rows, legend and a submit button  */}
        <form onSubmit={handleAddressSubmit}>
          <fieldset>
            <legend>🏠 Find an address</legend>
            <div className={styles.formRow}>
              <InputText
                name="postCode"
                onChange={onChange}
                placeholder="Post Code"
                value={formFields.postCode}
              />
            </div>
            <div className={styles.formRow}>
              <InputText
                name="houseNumber"
                onChange={onChange}
                value={formFields.houseNumber}
                placeholder="House number"
              />
            </div>
            <Button type="submit">Find</Button>
          </fieldset>
        </form>
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
        {/* TODO: Create generic <Form /> component to display form rows, legend and a submit button  */}
        {formFields.selectedAddress && (
          <form onSubmit={handlePersonSubmit}>
            <fieldset>
              <legend>✏️ Add personal info to address</legend>
              <div className={styles.formRow}>
                <InputText
                  name="firstName"
                  placeholder="First name"
                  onChange={onChange}
                  value={formFields.firstName}
                />
              </div>
              <div className={styles.formRow}>
                <InputText
                  name="lastName"
                  placeholder="Last name"
                  onChange={onChange}
                  value={formFields.lastName}
                />
              </div>
              <Button type="submit">Add to addressbook</Button>
            </fieldset>
          </form>
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
