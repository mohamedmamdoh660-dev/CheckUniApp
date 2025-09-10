export const GET_STUDENTS = `
  query GetStudents {
    zoho_studentsCollection {
      edges {
        node {
          id
          created_at
          updated_at
          first_name
          last_name
          gender
          date_of_birth
          nationality
          passport_number
          passport_issue_date
          passport_expiry_date
          country_of_residence
          email
          mobile
          father_name
          father_mobile
          father_job
          mother_name
          mother_mobile
          mother_job
        }
      }
    }
  }
`;

export const GET_STUDENTS_PAGINATION = `
  query GetStudentsPagination($search: String!, $limit: Int!, $offset: Int!, $filter: zoho_studentsFilter) {
    zoho_studentsCollection(
      filter: $filter
      first: $limit
      offset: $offset
            orderBy: [{ created_at: DescNullsLast }]

    ) {
      edges {
        node {
          id
          created_at
          updated_at
          first_name
          last_name
          gender
          date_of_birth
          nationality
          passport_number
          passport_issue_date
          passport_expiry_date
          country_of_residence
          email
          mobile
          father_name
          father_mobile
          father_job
          mother_name
          mother_mobile
          mother_job
         nationality_record:  zoho_countries  {
         id
            name
        }
            country_of_residence_record: zoho_countries {
            id
            name
          }
        }
      }
    }
  }
`;

export const GET_STUDENTS_COUNT = `
  query GetStudentsCount($search: String!) {
    zoho_studentsCollection(
      filter: { or: [
        { first_name: { like: $search } },
        { last_name: { like: $search } },
        { email: { like: $search } }
      ] }
    ) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

export const GET_STUDENT_BY_ID = `
  query GetStudentById($id: ID!) {
    zoho_studentsCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          created_at
          updated_at
          first_name
          last_name
          gender
          date_of_birth
          nationality
          passport_number
          passport_issue_date
          passport_expiry_date
          country_of_residence
          email
          mobile
          father_name
          father_mobile
          father_job
          mother_name
          mother_mobile
          mother_job
        }
      }
    }
  }
`;

export const INSERT_STUDENT = `
  mutation InsertStudent($objects: [zoho_studentsInsertInput!]!) {
    insertIntozoho_studentsCollection(objects: $objects) {
      records {
        id
      }
    }
  }
`;

export const UPDATE_STUDENT = `
  mutation UpdateStudent(
    $id: ID!
    $first_name: String
    $last_name: String
    $gender: String
    $date_of_birth: String
    $nationality: String
    $passport_number: String
    $passport_issue_date: String
    $passport_expiry_date: String
    $country_of_residence: String
    $email: String
    $mobile: String
    $father_name: String
    $father_mobile: String
    $father_job: String
    $mother_name: String
    $mother_mobile: String
    $mother_job: String
  ) {
    updatezoho_studentsCollection(
      filter: { id: { eq: $id } }
      set: {
        first_name: $first_name
        last_name: $last_name
        gender: $gender
        date_of_birth: $date_of_birth
        nationality: $nationality
        passport_number: $passport_number
        passport_issue_date: $passport_issue_date
        passport_expiry_date: $passport_expiry_date
        country_of_residence: $country_of_residence
        email: $email
        mobile: $mobile
        father_name: $father_name
        father_mobile: $father_mobile
        father_job: $father_job
        mother_name: $mother_name
        mother_mobile: $mother_mobile
        mother_job: $mother_job
        updated_at: "now()"
      }
    ) {
      records {
        id
      }
    }
  }
`;

export const DELETE_STUDENT = `
  mutation DeleteStudent($id: ID!) {
    deleteFromzoho_studentsCollection(filter: { id: { eq: $id } }) {
      records {
        id
      }
    }
  }
`;
