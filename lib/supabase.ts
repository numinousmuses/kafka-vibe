import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to ensure the sessions table exists
export async function ensureSessionsTableExists() {
  try {
    // Remove debug alert
    // window.alert("ensureSessionsTableExists");

    // Check if the table exists
    const { error: checkError } = await supabase
      .from("sessions")
      .select("id")
      .limit(1);

    // If there's an error, the table might not exist
    if (checkError && checkError.code === "42P01") {
      // PostgreSQL code for undefined_table
      console.log("Sessions table doesn't exist. Creating it...");

      // Instead of using RPC functions that don't exist, use the SQL API directly
      const { error: createError } = await supabase.from("sessions").insert([
        {
          created_at: new Date().toISOString(),
          messages: [],
          files: [],
        },
      ]);

      // If we get a "relation does not exist" error, we need to create the table
      // But since we can't create tables directly from the client, we'll return false
      // and handle this situation differently
      if (
        createError &&
        (createError.code === "42P01" ||
          createError.message.includes("does not exist"))
      ) {
        console.error(
          "Cannot create sessions table from client side:",
          createError
        );
        return false;
      } else if (createError) {
        console.error("Error creating sessions table:", createError);
        return false;
      }

      console.log("Sessions table created successfully");
    } else if (checkError) {
      console.error("Error checking for sessions table:", checkError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in ensureSessionsTableExists:", error);
    return false;
  }
}

// Function to create a new session
export async function createSession() {
  try {
    // Remove debug alert
    // window.alert("create session");

    // Try to create a session directly without checking if table exists
    const { data, error } = await supabase
      .from("sessions")
      .insert([
        { created_at: new Date().toISOString(), messages: [], files: [] },
      ])
      .select();

    if (error) {
      console.error("Error creating session:", error);

      // If the error is because the table doesn't exist, we need to handle this differently
      if (
        error.code === "42P01" ||
        (error.message && error.message.includes("does not exist"))
      ) {
        console.error(
          "Sessions table doesn't exist. You need to create it in the Supabase dashboard."
        );
        // You could show a more user-friendly message here
      }

      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error("Unexpected error in createSession:", error);
    return null;
  }
}

// Function to update session messages
export async function updateSessionMessages(
  sessionId: string,
  messages: any[]
) {
  const { error } = await supabase
    .from("sessions")
    .update({ messages })
    .eq("id", sessionId);

  if (error) {
    console.error("Error updating session messages:", error);
    return false;
  }

  return true;
}

export async function getSessionData(sessionId: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  console.log("getSessionData", data, error);

  return data;
}

// Function to update workspace files
export async function updateWorkspaceFiles(sessionId: string, files: any[]) {
  try {
    const { error } = await supabase
      .from("sessions")
      .update({ files })
      .eq("id", sessionId);

    if (error) {
      console.error("Error updating workspace files:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in updateWorkspaceFiles:", error);
    return false;
  }
}
