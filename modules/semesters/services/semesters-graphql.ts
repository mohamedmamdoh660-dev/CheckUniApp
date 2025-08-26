export const GET_SEMESTERS = `
  query GetSemesters($filter: zoho_semestersFilter, $limit: Int!, $offset: Int!, $orderBy: [zoho_semestersOrderBy!]) {
    zoho_semestersCollection(
      filter: $filter
      first: $limit
      offset: $offset
    orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          name
          active
          created_at
          updated_at
        }
      }
    }
  }
`;

export const GET_SEMESTER_BY_ID = `
  query GetSemesterById($id: BigInt!) {
    zoho_semestersCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          name
          active
          created_at
          updated_at
        }
      }
    }
  }
`;

export const CREATE_SEMESTER = `
  mutation CreateSemester($objects: [zoho_semestersInsertInput!]!) {
    insertIntozoho_semestersCollection(objects: $objects) {
      records {
        id
        name
        active
        created_at
        updated_at
      }
    }
  }
`;

export const UPDATE_SEMESTER = `
  mutation UpdateSemester(
    $id: BigInt!
    $name: String
    $active: Boolean
  ) {
    updatezoho_semestersCollection(
      filter: { id: { eq: $id } }
      set: { 
        name: $name, 
        active: $active,
        updated_at: "now()"
      }
    ) {
      records {
        id
        name
        active
        created_at
        updated_at
      }
    }
  }
`;

export const DELETE_SEMESTER = `
  mutation DeleteSemester($id: BigInt!) {
    deleteFromzoho_semestersCollection(filter: { id: { eq: $id } }) {
      records {
        id
      }
    }
  }
`;