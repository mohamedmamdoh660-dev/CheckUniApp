export const GET_NOTIFICATIONS = `
 
  query GetNotifications($agent_id: UUID, $limit: Int, $offset: Int, $only_unread: Boolean) {
    zoho_notificationsCollection(
      filter: {
        and: [
          { agent_id: { eq: $agent_id } },
          { is_read: { eq: false }  }
        ]
      }
      first: $limit
      offset: $offset
      orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          created_at
          updated_at
          title
          content
          module_name
          module_id
          agent_id
          
          priority
          is_read
        }
      }
    }
  }

`;

export const INSERT_NOTIFICATION = `
  mutation InsertNotification($objects: [zoho_notificationsInsertInput!]!) {
    insertIntozoho_notificationsCollection(objects: $objects) {
      records {
        id
      }
    }
  }
`;

export const MARK_NOTIFICATIONS_READ = `
  mutation MarkNotificationsRead($agent_id: UUID!) {
    updatezoho_notificationsCollection(
      filter: { agent_id: { eq: $agent_id }, is_read: { eq: false } }
      set: { is_read: true }
    ) {
      records { id is_read }
    }
  }
`;


