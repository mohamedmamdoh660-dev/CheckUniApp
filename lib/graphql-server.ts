import { supabaseServerClient } from "./supabase-server-client";

export async function executeGraphQLBackend<T = any>(query: string, variables?: Record<string, any>) {
  try {
    // Get the current session to extract the token
    const { data: { session } } = await supabaseServerClient().auth.getSession();
    const token = session?.access_token;

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    return result.data as T;
  } catch (error) {
    console.error('GraphQL Error:', error);
    throw error;
  }
} 