export const GET_PROGRAMS = `
  query GetPrograms  {
    zoho_programsCollection(
          filter: { and: [{ active_applications: { eq: true } }, { active: { eq: true } }] }

    ) {
      edges {
        node {
          id
          name
        
        }
      }
    }
  }
`;

export const GET_PROGRAMS_PAGINATION = `
  query GetProgramsPagination($search: String!, $limit: Int!, $offset: Int!) {
    zoho_programsCollection(
      filter: { and: [{ name: { ilike: $search } }, { active: { eq: true } }] }
      first: $limit
      offset: $offset
    orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          name
          faculty
          speciality
          degree
          language
          university
          city
          country
          created_at
          updated_at
          official_tuition
          discounted_tuition
          tuition_currency
          active
          active_applications
          study_years
          zoho_countries {
            id
            name
            country_code
          }
          zoho_degrees {
            id
            name
          }
          zoho_faculty {
            id
            name
          }
          zoho_languages {
            id
            name
          }
          zoho_speciality {
            id
            name
          }
          zoho_cities {
            id
            name
          }
          zoho_universities {
            id
            name
            sector
            logo
          }
        }
      }
    }
  }
`;

export const GET_PROGRAMS_COUNT = `
  query GetProgramsCount($search: String!) {
    zoho_programsCollection(filter: { name: { like: $search } }) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

export const GET_PROGRAM_BY_ID = `
  query GetProgramById($id: ID!) {
    zoho_programsCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          name
          faculty
          speciality
          degree
          language
          university
          city
          country
          created_at
          updated_at
          official_tuition
          discounted_tuition
          tuition_currency
          active
          active_applications
          study_years
          zoho_countries {
            id
            name
            country_code
          }
          zoho_degrees {
            id
            name
          }
          zoho_faculty {
            id
            name
          }
          zoho_languages {
            id
            name
          }
          zoho_speciality {
            id
            name
          }
          zoho_cities {
            id
            name
          }
          zoho_universities {
            id
            name
            sector
            logo
          }
        }
      }
    }
  }
`;

export const INSERT_PROGRAM = `
  mutation InsertProgram($objects: [zoho_programsInsertInput!]!) {
    insertIntozoho_programsCollection(objects: $objects) {
      records {
        id
      }
    }
  }
`;

export const UPDATE_PROGRAM = `
  mutation UpdateProgram(
    $id: ID!
    $name: String
    $faculty: BigInt
    $speciality: BigInt
    $degree: BigInt
    $language: BigInt
    $university: BigInt
    $city: BigInt
    $country: BigInt
    $official_tuition: String
    $discounted_tuition: String
    $tuition_currency: String
    $active: Boolean
    $active_applications: Boolean
    $study_years: String
  ) {
    updatezoho_programsCollection(
      filter: { id: { eq: $id } }
      set: {
        name: $name
        faculty: $faculty
        speciality: $speciality
        degree: $degree
        language: $language
        university: $university
        city: $city
        country: $country
        official_tuition: $official_tuition
        discounted_tuition: $discounted_tuition
        tuition_currency: $tuition_currency
        active: $active
        active_applications: $active_applications
        study_years: $study_years
        updated_at: "now()"
      }
    ) {
      records {
        id
      }
    }
  }
`;

export const DELETE_PROGRAM = `
  mutation DeleteProgram($id: ID!) {
    deleteFromzoho_programsCollection(filter: { id: { eq: $id } }) {
      records {
        id
      }
    }
  }
`;

export const GET_ZOHO_COUNTRIES = `
  query GetZohoCountries {
    zoho_countriesCollection {
      edges {
        node {
          id
          name
       
        }
      }
    }
  }
`;

export const GET_ZOHO_CITIES = `
  query GetZohoCities {
    zoho_citiesCollection {
      edges {
        node {
          id
          name
         
        }
      }
    }
  }
`;

export const GET_ZOHO_CITIES_BY_COUNTRY = `
  query GetZohoCitiesByCountry($countryId: BigInt!) {
    zoho_citiesCollection(filter: { country: { eq: $countryId } }) {
      edges {
        node {
          id
          name
          country
        }
      }
    }
  }
`;

export const GET_ZOHO_UNIVERSITIES = `
  query GetZohoUniversities {
    zoho_universitiesCollection {
      edges {
        node {
          id
          name
        
        }
      }
    }
  }
`;

export const GET_ZOHO_UNIVERSITIES_BY_CITY = `
  query GetZohoUniversitiesByCity($cityId: BigInt!) {
    zoho_universitiesCollection(filter: { city: { eq: $cityId } }) {
      edges {
        node {
          id
          name
          sector
          logo
        }
      }
    }
  }
`;

export const GET_ZOHO_UNIVERSITIES_BY_COUNTRY = `
  query GetZohoUniversitiesByCountry($countryId: BigInt!) {
    zoho_universitiesCollection(filter: { country: { eq: $countryId } }) {
      edges {
        node {
          id
          name
          sector
          logo
        }
      }
    }
  }
`;

export const GET_ZOHO_DEGREES = `
  query GetZohoDegrees {
    zoho_degreesCollection {
      edges {
        node {
          id
          name
          code
          active
        }
      }
    }
  }
`;

export const GET_ZOHO_FACILITIES = `
  query GetZohoFacilities {
    zoho_facultyCollection {
      edges {
        node {
          id
          name
          active
        }
      }
    }
  }
`;

export const GET_ZOHO_LANGUAGES = `
  query GetZohoLanguages {
    zoho_languagesCollection {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const GET_ZOHO_SPECIALITIES = `
  query GetZohoSpecialities {
    zoho_specialityCollection {
      edges {
        node {
          id
          name
          active
          faculty_id
        }
      }
    }
  }
`;