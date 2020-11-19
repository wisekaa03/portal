/** @format */

import { gql } from '@apollo/client';

export const PROFILE_FRAGMENT = gql`
  fragment ProfileProps on Profile {
    id
    contact
    loginDomain
    username
    firstName
    lastName
    middleName
    fullName
    birthday
    gender
    company
    management
    department
    division
    nameEng
    companyEng
    managementEng
    departmentEng
    divisionEng
    positionEng
    title
    employeeID
    telephone
    workPhone
    email
    mobile
    manager {
      id
      firstName
      lastName
      middleName
      fullName
      disabled
      notShowing
    }
    country
    postalCode
    region
    town
    street
    room
    accessCard
    updatedAt
    createdAt
    disabled
    notShowing
  }
`;
