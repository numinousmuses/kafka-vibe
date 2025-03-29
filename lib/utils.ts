import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ToolDocumentation {
  name: string;
  shortDescription: string;
  docs: string;
  function: string;
  icon: string;
}

export const tools: ToolDocumentation[] = [
  // Gmail
  {
    name: "Gmail - Send Email",
    shortDescription: "Send an email through a Gmail account",
    function: "gmail.send_email",
    icon: "Mail", // Lucide icon
    docs: `Sends an email through a Gmail account.
    
Input:
- receiver (Required): Email address of the receiver, or multiple addresses separated by commas
- subject (Required): The email subject
- body_text (Required): Text version of the body for the email you want to send
- reply_to (Optional): Email address to set as the "Reply-To" header
- body_html (Optional): HTML version of the body for the email you want to send
- attachment (Optional): File to attach to the email you want to send

Example: 
gmail.send_email({
  receiver: "example@example.com",
  subject: "Meeting Reminder",
  body_text: "Don't forget our meeting tomorrow at 2pm."
})`
  },
  {
    name: "Gmail - Find Email",
    shortDescription: "Find an email in your Gmail account",
    function: "gmail.gmail_search_mail",
    icon: "MailSearch", // Lucide icon
    docs: `Searches for an email in your Gmail account.
    
Input:
- subject (Optional): The email subject
- fromAddress (Optional): The address sending the new mail
- to (Optional): The address receiving the new mail
- label (Optional): The label tagged to the mail
- category (Optional): Category of the mail

Example:
gmail.gmail_search_mail({
  subject: "Invoice",
  fromAddress: "billing@company.com"
})`
  },
  
  // Google Sheets
  {
    name: "Google Sheets - Insert Row",
    shortDescription: "Append a row of values to an existing sheet",
    function: "google_sheets.insert_row",
    icon: "PlusSquare", // Lucide icon
    docs: `Append a row of values to an existing sheet.
    
Input:
- spreadsheet_id (Required): The spreadsheet's unique identifier
- include_team_drives (Required): Determines if sheets from Team Drives should be included in the results
- sheet_id (Required): The sheet's unique identifier
- as_string (Optional): Inserted values that are dates and formulas will be entered strings and have no effect
- first_row_headers (Required): If the first row is headers
- values (Required): The values to insert

Example:
google_sheets.insert_row({
  spreadsheet_id: "1abc123def456",
  include_team_drives: true,
  sheet_id: "Sheet1",
  first_row_headers: true,
  values: { name: "John Doe", email: "john@example.com" }
})`
  },
  {
    name: "Google Sheets - Delete Row",
    shortDescription: "Delete a row on an existing sheet",
    function: "google_sheets.delete_row",
    icon: "Trash2", // Lucide icon
    docs: `Delete a row on an existing sheet you have access to.
    
Input:
- spreadsheet_id (Required): The spreadsheet's unique identifier
- include_team_drives (Required): Determines if sheets from Team Drives should be included in the results
- sheet_id (Required): The sheet's unique identifier
- row_id (Required): The row number to remove

Example:
google_sheets.delete_row({
  spreadsheet_id: "1abc123def456",
  include_team_drives: true,
  sheet_id: "Sheet1",
  row_id: 4
})`
  },
  {
    name: "Google Sheets - Update Row",
    shortDescription: "Overwrite values in an existing row",
    function: "google_sheets.update_row",
    icon: "Edit", // Lucide icon
    docs: `Overwrite values in an existing row.
    
Input:
- spreadsheet_id (Required): The spreadsheet's unique identifier
- include_team_drives (Required): Determines if sheets from Team Drives should be included in the results
- sheet_id (Required): The sheet's unique identifier
- row_id (Required): The row number to update
- first_row_headers (Required): If the first row is headers
- values (Required): The values to insert

Example:
google_sheets.update_row({
  spreadsheet_id: "1abc123def456",
  include_team_drives: true,
  sheet_id: "Sheet1",
  row_id: 5,
  first_row_headers: true,
  values: { name: "Jane Doe", email: "jane@example.com" }
})`
  },
  {
    name: "Google Sheets - Find Rows",
    shortDescription: "Find rows in a Google Sheet",
    function: "google_sheets.find_rows",
    icon: "Search", // Lucide icon
    docs: `Find rows in a Google Sheet.
    
Input:
- spreadsheet_id (Required): The spreadsheet's unique identifier
- include_team_drives (Required): Determines if sheets from Team Drives should be included in the results
- sheet_id (Required): The sheet's unique identifier
- column_name (Required): Column Name
- search_value (Required): The value to search for

Example:
google_sheets.find_rows({
  spreadsheet_id: "1abc123def456",
  include_team_drives: true,
  sheet_id: "Sheet1",
  column_name: "email",
  search_value: "jane@example.com"
})`
  },
  {
    name: "Google Sheets - Clear Sheet",
    shortDescription: "Clears all rows on an existing sheet",
    function: "google_sheets.clear_sheet",
    icon: "Eraser", // Lucide icon
    docs: `Clears all rows on an existing sheet.
    
Input:
- spreadsheet_id (Required): The spreadsheet's unique identifier
- include_team_drives (Required): Determines if sheets from Team Drives should be included in the results
- sheet_id (Required): The sheet's unique identifier
- is_first_row_headers (Required): If the first row is headers

Example:
google_sheets.clear_sheet({
  spreadsheet_id: "1abc123def456",
  include_team_drives: true,
  sheet_id: "Sheet1",
  is_first_row_headers: true
})`
  },
  
  // Google Calendar
  {
    name: "Google Calendar - Update Event",
    shortDescription: "Updates an event in Google Calendar",
    function: "google_calendar.update_event",
    icon: "CalendarClock", // Lucide icon
    docs: `Updates an event in Google Calendar.
    
Input:
- calendar_id (Required): The calendar's identifier
- eventId (Required): The event's identifier
- title (Optional): The event title
- start_date_time (Optional): The start date and time
- end_date_time (Optional): The end date and time
- summary (Optional): The event summary

Example:
google_calendar.update_event({
  calendar_id: "primary",
  eventId: "abc123def456",
  title: "Team Meeting",
  start_date_time: "2023-06-15T10:00:00",
  end_date_time: "2023-06-15T11:00:00"
})`
  },
  
  // Google Contacts
  {
    name: "Google Contacts - Add Contact",
    shortDescription: "Add a contact to a Google Contacts account",
    function: "google_contacts.add_contact",
    icon: "UserPlus", // Lucide icon
    docs: `Add a contact to a Google Contacts account.
    
Input:
- firstName (Required): The first name of the contact
- middleName (Optional): The middle name of the contact
- lastName (Required): The last name of the contact
- jobTitle (Optional): The job title of the contact
- company (Optional): The company of the contact
- email (Optional): The email address of the contact
- phoneNumber (Optional): The phone number of the contact

Example:
google_contacts.add_contact({
  firstName: "John",
  lastName: "Smith",
  email: "john.smith@example.com",
  phoneNumber: "+1234567890",
  jobTitle: "Software Engineer",
  company: "Tech Corp"
})`
  },
  
  // Slack
  {
    name: "Slack - Send Message To A User",
    shortDescription: "Send message to a user on Slack",
    function: "slack.send_direct_message",
    icon: "MessageSquare", // Lucide icon
    docs: `Send message to a user on Slack.
    
Input:
- userId (Required): Message receiver
- text (Required): The text of your message
- username (Optional): The username of the bot
- profilePicture (Optional): The profile picture of the bot

Example:
slack.send_direct_message({
  userId: "U012ABC3456",
  text: "Hello, could you review the document I shared?",
  username: "Notification Bot"
})`
  },
  {
    name: "Slack - Send Message To A Channel",
    shortDescription: "Send message to a channel on Slack",
    function: "slack.send_channel_message",
    icon: "MessageCircle", // Lucide icon
    docs: `Send message to a channel on Slack.
    
Input:
- channel (Required): Channel, private group, or IM channel to send message to
- text (Required): The text of your message
- username (Optional): The username of the bot
- profilePicture (Optional): The profile picture of the bot

Example:
slack.send_channel_message({
  channel: "C012ABC3456",
  text: "The weekly report is now available!",
  username: "Report Bot"
})`
  },
  {
    name: "Slack - Request Approval From A User",
    shortDescription: "Send approval message to a user and wait for response",
    function: "slack.request_approval_direct_message",
    icon: "ThumbsUpDown", // Lucide icon
    docs: `Send approval message to a user and then wait until the message is approved or disapproved.
    
Input:
- userId (Required): Message receiver
- text (Required): The text of your message
- username (Optional): The username of the bot
- profilePicture (Optional): The profile picture of the bot

Example:
slack.request_approval_direct_message({
  userId: "U012ABC3456",
  text: "Can you approve the purchase order #12345?",
  username: "Approval Bot"
})`
  },
  {
    name: "Slack - Request Approval in a Channel",
    shortDescription: "Send approval message to a channel and wait for response",
    function: "slack.request_approval_message",
    icon: "ThumbsUpDown", // Lucide icon
    docs: `Send approval message to a channel and then wait until the message is approved or disapproved.
    
Input:
- channel (Required): Channel, private group, or IM channel to send message to
- text (Required): The text of your message
- username (Optional): The username of the bot
- profilePicture (Optional): The profile picture of the bot

Example:
slack.request_approval_message({
  channel: "C012ABC3456",
  text: "Team, can someone approve the new design mockups?",
  username: "Design Approval Bot"
})`
  },
  
  // Salesforce
  {
    name: "Salesforce - Run Query",
    shortDescription: "Run a Salesforce query",
    function: "salesforce.run_query",
    icon: "Database", // Lucide icon
    docs: `Run a Salesforce query.
    
Input:
- query (Required): Enter the SOQL query

Example:
salesforce.run_query({
  query: "SELECT Id, Name FROM Account WHERE LastModifiedDate > YESTERDAY"
})`
  },
  {
    name: "Salesforce - Create Object",
    shortDescription: "Create a new object in Salesforce",
    function: "salesforce.create_new_object",
    icon: "FilePlus", // Lucide icon
    docs: `Create a new object in Salesforce.
    
Input:
- object (Required): Select the Object
- data (Required): Select mapped object

Example:
salesforce.create_new_object({
  object: "Lead",
  data: {
    FirstName: "John",
    LastName: "Smith",
    Email: "john.smith@example.com",
    Company: "ABC Corp"
  }
})`
  },
  {
    name: "Salesforce - Update Object",
    shortDescription: "Update an existing object in Salesforce",
    function: "salesforce.update_object_by_id",
    icon: "Pencil", // Lucide icon
    docs: `Update an object by Id in Salesforce.
    
Input:
- object (Required): Select the Object
- id (Required): Select the Id
- data (Required): Select mapped object

Example:
salesforce.update_object_by_id({
  object: "Contact",
  id: "003XXXXXXXXXXXXXXX",
  data: {
    Phone: "+1234567890",
    Title: "CTO"
  }
})`
  },
  {
    name: "Salesforce - Batch Upsert",
    shortDescription: "Batch upsert records by external id",
    function: "salesforce.upsert_by_external_id",
    icon: "Package", // Lucide icon
    docs: `Batch upsert records by external id in Salesforce.
    
Input:
- object (Required): Select the Object
- external_field (Required): Select the External Field
- records (Required): Select the Records

Example:
salesforce.upsert_by_external_id({
  object: "Account",
  external_field: "External_ID__c",
  records: [
    {
      External_ID__c: "A001",
      Name: "Acme Corp",
      Industry: "Technology"
    },
    {
      External_ID__c: "A002", 
      Name: "Globex",
      Industry: "Manufacturing"
    }
  ]
})`
  },
  
  // Monday
  {
    name: "Monday - Create Item",
    shortDescription: "Create a new item inside a board",
    function: "monday.monday_create_item",
    icon: "PlusSquare", // Lucide icon
    docs: `Create a new item inside a board on Monday.com.
    
Input:
- workspace_id (Required): The workspace's unique identifier
- board_id (Required): The board's unique identifier
- group_id (Optional): Board Group
- item_name (Required): Item Name
- column_values (Optional): The column values of the new item
- create_labels_if_missing (Optional): Creates status/dropdown labels if they are missing

Example:
monday.monday_create_item({
  workspace_id: "12345",
  board_id: "67890",
  group_id: "topics",
  item_name: "New Feature Implementation",
  column_values: {
    status: "Working on it",
    date: "2023-06-30",
    person: "12345"
  },
  create_labels_if_missing: true
})`
  },
  
  // LinkedIn
  {
    name: "LinkedIn - Search People",
    shortDescription: "Search for people on LinkedIn",
    function: "linkedin.search_people",
    icon: "Search", // Lucide icon
    docs: `Search for people on LinkedIn.
    
Input:
- keywords (Optional): Keywords to search for
- keywordsFirstName (Optional): Keywords to search for in first name
- keywordsLastName (Optional): Keywords to search for in last name
- keywordsTitle (Optional): Keywords to search for in title
- keywordsCompany (Optional): Keywords to search for in company
- keywordsSchool (Optional): Keywords to search for in school
- networkDepths (Optional): Depth of connection
- limit (Optional): Limit number of results

Example:
linkedin.search_people({
  keywordsTitle: "Software Engineer",
  keywordsCompany: "Google",
  limit: 10
})`
  },
  {
    name: "LinkedIn - Get Own Profile",
    shortDescription: "Retrieve your own LinkedIn profile",
    function: "linkedin.get_own_profile",
    icon: "User", // Lucide icon
    docs: `Get your own LinkedIn profile information.
    
Input: No parameters required

Example:
linkedin.get_own_profile()`
  },
  {
    name: "LinkedIn - Send Invite",
    shortDescription: "Send an invitation to a LinkedIn user",
    function: "linkedin.send_invite",
    icon: "UserPlus", // Lucide icon
    docs: `Send an invite to a LinkedIn user.
    
Input:
- profileId (Required): The profile ID of the user
- message (Optional): The message to send to the user

Example:
linkedin.send_invite({
  profileId: "john-smith-12345",
  message: "I'd like to connect with you to discuss potential collaboration opportunities."
})`
  },
  
  // Outlook
  {
    name: "Outlook - Send Email",
    shortDescription: "Send an email using Outlook",
    function: "outlook.send_email",
    icon: "Mail", // Lucide icon
    docs: `Send an email using Microsoft Outlook.
    
Input:
- fromAddress (Optional): The sender's email address
- to (Required): Recipient email addresses
- cc (Optional): CC recipient email addresses
- replyTo (Optional): Reply-to email address
- bcc (Optional): BCC recipient email addresses
- subject (Required): Email subject
- body (Required): Email body content

Example:
outlook.send_email({
  to: ["recipient@example.com"],
  subject: "Meeting Agenda",
  body: "Here's the agenda for our upcoming meeting...",
  cc: ["manager@example.com"]
})`
  },
  
  // Twilio
  {
    name: "Twilio - Send SMS",
    shortDescription: "Send an SMS message using Twilio",
    function: "twilio.send_sms",
    icon: "Smartphone", // Lucide icon
    docs: `Send a new SMS message using Twilio.
    
Input:
- fromNumber (Required): The phone number to send the message from
- body (Required): The body of the message to send
- toNumber (Required): The phone number to send the message to

Example:
twilio.send_sms({
  fromNumber: "+12345678901",
  toNumber: "+19876543210",
  body: "Your appointment is confirmed for tomorrow at 2pm."
})`
  },
  
  // Voice
  {
    name: "Voice - Make Phone Call",
    shortDescription: "Make a phone call to a number",
    function: "voice.call",
    icon: "PhoneCall", // Lucide icon
    docs: `Make a phone call to a phone number.
    
Input:
- fromNumber (Required): The phone number to call from
- toNumber (Required): The phone number to call
- info (Required): The information to use for the call
- objective (Required): The objective of the call
- start_sentence (Optional): The start sentence of the call
- voiceId (Optional): The voice ID to use for the call
- language (Optional): The language to use for the call
- callId (Optional): The ID of the caller
- model (Optional): The model to use for the request (default: gpt-3.5-turbo-16k)
- wsBaseUrl (Optional): The base URL for the websocket

Example:
voice.call({
  fromNumber: "+12345678901",
  toNumber: "+19876543210",
  info: { name: "John Smith", appointment_time: "2pm tomorrow" },
  objective: "Confirm the customer's appointment",
  start_sentence: "Hello, I'm calling from ABC Clinic to confirm your appointment.",
  voiceId: "Alloy"
})`
  },
  
  // File
  {
    name: "File - Save File",
    shortDescription: "Save a file to the file system",
    function: "file.save_file",
    icon: "Save", // Lucide icon
    docs: `Save a file to the file system.
    
Input:
- name (Required): The name of the file to save
- content (Required): The content of the file to save
- extension (Required): The extension of the file to save

Example:
file.save_file({
  name: "customer_data",
  content: "Name,Email,Phone\\nJohn Doe,john@example.com,123-456-7890",
  extension: "csv"
})`
  },
  
  // Extract
  {
    name: "Extract - Extract Information",
    shortDescription: "Extract structured information from text",
    function: "extract.extract",
    icon: "Filter", // Lucide icon
    docs: `Extract information from text.
    
Input:
- text (Required): The text from which the information needs to be extracted
- titles (Required): Titles for the information to be extracted, separated by commas
- descriptions (Required): Descriptions for the information to be extracted, separated by commas
- enums (Required): Enums for the information to be extracted, separated by commas
- temperature (Optional): The temperature of the model (0-1)
- model (Optional): The model to use (default: gpt-3.5-turbo-16k)

Example:
extract.extract({
  text: "John Doe has 5 years of experience working at Google as a software engineer.",
  titles: "Name, Experience, Company, Position",
  descriptions: "The name of the person, Years of work experience, Company name, Job title",
  enums: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10"
})`
  },
  
  // Answer
  {
    name: "Answer - Answer Question",
    shortDescription: "Answer a question based on provided information",
    function: "answer.answer",
    icon: "MessageQuestion", // Lucide icon
    docs: `Answer a question based on provided information.
    
Input:
- obj (Required): The object to extract information from
- question (Required): The question to answer
- model (Optional): The model to use (default: gpt-3.5-turbo-16k)

Example:
answer.answer({
  obj: { name: "John", age: 30, occupation: "Software Engineer" },
  question: "What is John's occupation?"
})`
  },
  
  // Link
  {
    name: "Link - Read Text From Link",
    shortDescription: "Read text content from a URL",
    function: "link.read_link",
    icon: "Link", // Lucide icon
    docs: `Read the text content from a link.
    
Input:
- link (Required): The URL to read the text from

Example:
link.read_link({
  link: "https://example.com/article"
})`
  },
  {
    name: "Link - Read Text From Link Using Vision",
    shortDescription: "Read text content from a URL using vision capabilities",
    function: "link.read_link_vision",
    icon: "Eye", // Lucide icon
    docs: `Read the text content from a link using vision capabilities.
    
Input:
- link (Required): The URL to read the text from
- schema (Required): The schema to use for the request

Example:
link.read_link_vision({
  link: "https://example.com/infographic",
  schema: "title, main_points, key_takeaways"
})`
  },
  
  // Brainbase Table
  {
    name: "Brainbase Table - Find Rows",
    shortDescription: "Read rows from a database table",
    function: "brainbase_table.find_rows",
    icon: "Search", // Lucide icon
    docs: `Read rows from a table in the database.
    
Input:
- timezone (Optional): Timezone for the mysql server to use
- table (Required): The name of the table
- condition (Required): SQL condition, can also include logic operators
- args (Optional): Arguments can be used using ? in the condition
- columns (Optional): Specify the columns you want to select

Example:
brainbase_table.find_rows({
  table: "customers",
  condition: "last_purchase_date > ? AND status = ?",
  args: ["2023-01-01", "active"],
  columns: ["id", "name", "email"]
})`
  },
  {
    name: "Brainbase Table - Insert Row",
    shortDescription: "Insert a new row into a database table",
    function: "brainbase_table.insert_row",
    icon: "PlusSquare", // Lucide icon
    docs: `Insert a new row into a table.
    
Input:
- timezone (Optional): Timezone for the mysql server to use
- table (Required): The name of the table
- values (Required): Values to be inserted into the row

Example:
brainbase_table.insert_row({
  table: "customers",
  values: {
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    signup_date: "2023-05-15"
  }
})`
  },
  {
    name: "Brainbase Table - Update Row",
    shortDescription: "Update row(s) in a database table",
    function: "brainbase_table.update_row",
    icon: "Edit", // Lucide icon
    docs: `Update one or more rows in a table.
    
Input:
- timezone (Optional): Timezone for the mysql server to use
- table (Required): The name of the table
- values (Required): Values to be updated
- search_column (Required): Column to search on
- search_value (Required): Value to search for

Example:
brainbase_table.update_row({
  table: "customers",
  values: {
    status: "inactive",
    last_updated: "2023-06-01"
  },
  search_column: "email",
  search_value: "john@example.com"
})`
  },
  {
    name: "Brainbase Table - Delete Row",
    shortDescription: "Delete row(s) from a database table",
    function: "brainbase_table.delete_row",
    icon: "Trash2", // Lucide icon
    docs: `Delete one or more rows from a table.
    
Input:
- timezone (Optional): Timezone for the mysql server to use
- table (Required): The name of the table
- search_column (Required): Column to search on
- search_value (Required): Value to search for

Example:
brainbase_table.delete_row({
  table: "customers",
  search_column: "status",
  search_value: "inactive"
})`
  },
  {
    name: "Brainbase Table - Get Tables",
    shortDescription: "Get a list of tables in the database",
    function: "brainbase_table.get_tables",
    icon: "Table", // Lucide icon
    docs: `Returns a list of tables in the database.
    
Input: No parameters required

Example:
brainbase_table.get_tables()`
  },
  {
    name: "Brainbase Table - Execute Query",
    shortDescription: "Execute a custom SQL query",
    function: "brainbase_table.execute_query",
    icon: "Database", // Lucide icon
    docs: `Execute a custom SQL query on the database.
    
Input:
- timezone (Optional): Timezone for the mysql server to use
- query (Required): The query string to execute, use ? for arguments
- args (Optional): Can be inserted in the query string using ?

Example:
brainbase_table.execute_query({
  query: "SELECT * FROM customers WHERE signup_date BETWEEN ? AND ? ORDER BY name",
  args: ["2023-01-01", "2023-06-30"]
})`
  },
  
  // Google Search
  {
    name: "Google Search - Search",
    shortDescription: "Search for information on Google",
    function: "google_search.search",
    icon: "Globe", // Lucide icon
    docs: `Search for the top results on Google given the query.
    
Input:
- query (Required): The query to search for on Google
- type (Optional): The type of search to perform

Example:
google_search.search({
  query: "latest developments in artificial intelligence",
  type: "news"
})`
  },
  
  // Code
  {
    name: "Code - Run Code",
    shortDescription: "Execute code",
    function: "code.run",
    icon: "Code2", // Lucide icon
    docs: `Run code with specified variables.
    
Input:
- globalVariables (Required): The dictionary of all variables
- code (Required): The code to be executed

Example:
code.run({
  globalVariables: {
    name: "John",
    age: 30,
    items: ["apple", "banana", "orange"]
  },
  code: "const message = 'Hello ' + name + '! You are ' + age + ' years old.'; return message;"
})`
  },
  
  // Brainbase Forms
  {
    name: "Brainbase Forms - Fill In",
    shortDescription: "Fill in a form with data",
    function: "brainbase_forms.fill_in",
    icon: "FileText", // Lucide icon
    docs: `Fill in a form with data.
    
Input:
- data (Required): The data to be filled in the form
- formTemplateId (Required): The ID of the Brainbase form template
- fontSize (Optional): The font size for the text

Example:
brainbase_forms.fill_in({
  formTemplateId: "form-123",
  data: {
    name: "John Doe",
    address: "123 Main St, Anytown, USA",
    phone: "555-123-4567"
  },
  fontSize: 12
})`
  },
  
  // API
  {
    name: "API - GET Request",
    shortDescription: "Make a GET request to an API endpoint",
    function: "api.get_req",
    icon: "Network", // Lucide icon
    docs: `Send a GET request to an API endpoint.
    
Input:
- url (Required): The URL of the API endpoint
- params (Optional): The query parameters to include in the request
- headers (Optional): The headers to include in the request

Example:
api.get_req({
  url: "https://api.example.com/users",
  params: {
    page: 1,
    limit: 10
  },
  headers: {
    "Authorization": "Bearer token123"
  }
})`
  },
  {
    name: "API - POST Request",
    shortDescription: "Make a POST request to an API endpoint",
    function: "api.post_req",
    icon: "Send", // Lucide icon
    docs: `Send a POST request to an API endpoint.
    
Input:
- url (Required): The URL of the API endpoint
- data (Required): The JSON data to send in the request
- headers (Optional): The headers to include in the request

Example:
api.post_req({
  url: "https://api.example.com/users",
  data: {
    name: "John Doe",
    email: "john@example.com"
  },
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer token123"
  }
})`
  }
];

export const BACKEND_BASE_URL = "http://localhost:8000/";