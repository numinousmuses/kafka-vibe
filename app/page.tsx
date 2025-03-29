"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, Trash, Edit3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChatInput } from "@/components/ui/chat-input";
import { Checkbox } from "@/components/ui/checkbox";
import { CodeShower } from "@/components/ui/code-shower";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FileItem, WorkspacePanel } from "@/components/ui/workspace-panel";
// import {
//   createSession,
//   getSessionData,
//   updateSessionMessages,
//   updateWorkspaceFiles,
// } from "@/lib/supabase";
import { set } from "date-fns";
const BACKEND_BASE_URL = "http://localhost:8000/";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Code2,
  History,
  Menu,
  MessageSquare,
  PanelRightOpen,
  Phone,
  Rocket,
  Search,
  Slack,
  Square,
  User,
  Video,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { uploadToS3 } from "@/lib/s3/client";
import { useToast } from "@/hooks/use-toast";
import { ChatFileBased, ChatFileBasedVersion } from "@/components/versionDiffExplorer/versionDiffExplorer";
import { tools } from "@/lib/utils";

interface Message {
  type:
    | "text"
    | "code"
    | "status"
    | "error"
    | "ai"
    | "user"
    | "result"
    | "file";
  role: "user" | "assistant";
  content: string;
  language?: string;
  uid?: string;
  filename?: string;
}
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Add this interface for the auth response
interface AuthResponse {
  email: string;
  user_id: string;
  workspaces: any[];
  models: any[];
}

// Add this interface for the chat response
interface ChatNewResponse {
  chat_id: string;
  name: string;
  last_updated: string;
}

interface ChatType {
  id: string;
  name: string;
  last_updated: string;
}

// Add a new function to parse steps from content
const parseSteps = (content: string) => {
  console.log("PARSING STEPS", content);
  const stepsRegex = /<steps>([\s\S]*?)<\/steps>/g;
  const matches = [...content.matchAll(stepsRegex)];

  if (matches.length === 0) return null;

  const stepsContent = matches[0][1];
  const steps = stepsContent
    .split("\n")
    .filter((line) => line.trim().startsWith("- [ ]"))
    .map((line) => {
      const indentLevel = line.indexOf("- [ ]") / 4;
      const text = line.replace("- [ ]", "").trim();
      return { text, indentLevel };
    });

  return steps;
};

const defaultModel = {
  name: process.env.NEXT_PUBLIC_DEFAULT_MODEL_NAME || "anthropic/claude-3.7-sonnet:beta",
  ak: process.env.NEXT_PUBLIC_DEFAULT_MODEL_KEY,
  base_url: process.env.NEXT_PUBLIC_DEFAULT_BASEURL
}

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [workspacePanelOpen, setWorkspacePanelOpen] = useState(false);
  const [workspaceFiles, setWorkspaceFiles] = useState<FileItem[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);
  const [email, setEmail] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatName, setChatName] = useState("");
  const [model, setModel] = useState("");
  const [modelList, setModelList] = useState<any[]>([]);
  const [showAddModelDialog, setShowAddModelDialog] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [chatlist, setChatlist] = useState<ChatType[]>(authResponse?.workspaces[0]?.chats || []);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [chatToRename, setChatToRename] = useState<ChatType | null>(null);
  const [newChatName, setNewChatName] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [basedFiles, setBasedFiles] = useState<ChatFileBased[]>([]);
  const [selectedBasedFileContent, setSelectedBasedFileContent] = useState<string>("");
  const [selectedBasedFileName, setSelectedBasedFileName] = useState<string>("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [animatedToolIndex, setAnimatedToolIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const [localActivePanel, setLocalActivePanel] = useState<
    "workspace" | "agent" | "integrations"
  >("workspace");
  const [isFileAnimating, setIsFileAnimating] = useState(false);

  useEffect(() => {
    console.log("Workspace files updated:", workspaceFiles);
    console.log('Selected based file name:', selectedBasedFileName);
    console.log('Based files:', basedFiles);
  }, [workspaceFiles, selectedBasedFileName]);

  // Initialize chat when component mounts - check URL for chat ID
  useEffect(() => {
    const initChat = async () => {
      // Check if there's a chat ID in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlChatId = urlParams.get("chatId");

      if (authResponse) {
        // Create new agent chat
        try {
          const formData = new FormData();
          formData.append("user_id", authResponse.user_id);
          formData.append(
            "workspace_id",
            authResponse.workspaces[0]?.id || "default"
          );
          formData.append("chat_name", "New Agent");

          const response = await fetch(`${BACKEND_BASE_URL}chat/new`, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Failed to create chat: ${response.status}`);
          }

          const chatData: ChatNewResponse = await response.json();
          setChatId(chatData.chat_id);
          setChatName(chatData.name);
          console.log("Created new chat with ID:", chatData.chat_id);

          // Update URL with chat ID without reloading the page
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set("chatId", chatData.chat_id);
          window.history.pushState({}, "", newUrl);

        } catch (error) {
          console.error("Error creating chat:", error);
        }

        setChatlist(authResponse.workspaces.flatMap((workspace) => workspace.chats) || []);
      }
      

      if (authResponse && authResponse?.models.length > 0) {
        setModel(authResponse.models[0].name);
        setModelList(authResponse.models);
        
      } else if (authResponse && authResponse?.models.length === 0) {
        try {
          await handleAddNewModel(authResponse?.user_id || "", defaultModel.name, defaultModel.ak!, defaultModel.base_url!);
        } catch (error) {
          console.log("Error adding new model:", error);
        }
      }
    };

    initChat();
  }, [authResponse]);

  // Connect to WebSocket using chatId instead of sessionId
  useEffect(() => {
    if (!chatId) return;

    console.log(`Connecting to WebSocket: ${BACKEND_BASE_URL}ws/${chatId}`);
    const ws = new WebSocket(`${BACKEND_BASE_URL}ws/${chatId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to WebSocket");
      setConnected(true);
    };

    ws.onmessage = (event) => {
      setIsLoading(false);
      try {
        // For text messages
        if (typeof event.data === "string" && !event.data.startsWith("{")) {
          // Direct text response
          setMessages((prev) => [
            ...prev,
            {
              type: "text",
              role: "assistant",
              content: event.data,
            },
          ]);
          return;
        }

        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data);

        if (data.conversation){
          setMessages(data.conversation);
          console.log("Received conversation:", data.conversation);
        }

        if (data.initial) {
          setChatId(data.chat_id);
          setChatName(data.chat_name || "");
          setMessages(data.conversation || []);
          setWorkspaceFiles(data.chat_files || []);
          setBasedFiles(data.chat_files_based || []);
          return; // do nothing else for now
        }
  

        if (data.action === "file_deleted") {
          const deletedFileId = data.message.deleted_file_id;
          // Remove the deleted file from the basedFiles list
          setBasedFiles(prevFiles =>
            prevFiles.filter(file => file.file_id !== deletedFileId)
          );

          return;
        }

        // Handle structured responses
        if (data.action === "agent_response") {
          const responseData = data.message;
          setWorkspacePanelOpen(true);

          // Handle file responses
          if (responseData.type === "file") {

            console.log("Received file response:", responseData);

            const fileContent =
              typeof responseData.content === "string"
                ? JSON.parse(responseData.content)
                : responseData.content;

            // Update chat history
            setMessages((prev) => [
              ...prev,
              {
                type: "file",
                role: responseData.role,
                content:
                  typeof fileContent === "string"
                    ? fileContent
                    : JSON.stringify(fileContent),
              },
            ]);

            // Process based file content
            if (fileContent.based_filename && fileContent.based_content) {

              console.log("Received based file content:", fileContent);

              setBasedFiles(prevFiles => {
                // Check if the file already exists
                const existingFileIndex = prevFiles.findIndex(
                    file => file.name === fileContent.based_filename
                );

        
                const currentTimestamp = new Date().toISOString();
        
                if (existingFileIndex >= 0) {
                    // Update existing file
                    const updatedFiles = [...prevFiles];
                    const updatedFile = {...updatedFiles[existingFileIndex]};
                    
                    // Create a new version
                    const newVersion: ChatFileBasedVersion = {
                    version_id: `v-${Date.now()}`,
                    diff: fileContent.based_content,
                    timestamp: currentTimestamp
                    };
                    
                    // Add to versions array and update latest content
                    updatedFile.latest_content = fileContent.based_content;
                    updatedFile.versions = [...updatedFile.versions, newVersion];
                    
                    updatedFiles[existingFileIndex] = updatedFile;
                    
                    return updatedFiles;
                } else {
                    // Add new file with initial version
                    return [...prevFiles, {
                    file_id: data.id,
                    name: fileContent.based_filename,
                    latest_content: fileContent.based_content,
                    versions: [{
                        version_id: `v-${Date.now()}`,
                        diff: fileContent.based_content,
                        timestamp: currentTimestamp
                    }],
                    type: "based"
                    } as ChatFileBased];
                }
              });


              setWorkspaceFiles((prevFiles) => {
                // Check if the file already exists
                const existingFileIndex = prevFiles.findIndex(
                  (file) => file.name === fileContent.based_filename
                );

                if (existingFileIndex >= 0) {
                  // Update existing file
                  const updatedFiles = [...prevFiles];
                  updatedFiles[existingFileIndex] = {
                    ...updatedFiles[existingFileIndex],
                    content: fileContent.based_content,
                  };
                  return updatedFiles;
                } else {
                  // Add new file
                  return [
                    ...prevFiles,
                    {
                      id: data.id,
                      name: fileContent.based_filename,
                      content: fileContent.based_content,
                      type: "code",
                      language: "code",
                      url: "",
                    },
                  ];
                }
              });

              // setLocalActivePanel("workspace");
              // Delay the state update that triggers opening the new file
              setTimeout(() => {
                // Turn off animation flag
                setIsFileAnimating(false);
                setLocalActivePanel("workspace");
                // Now update the selected file name so that your useEffect in WorkspacePanel fires
                setSelectedBasedFileName(fileContent.based_filename);
              }, 3200); // Adjust delay as needed

              toast({
                title: "New Based File Generated",
                description:  `${fileContent.based_filename} has been added to the workspace.`,
              })

            }
          } else {
            // Handle other response types (text, etc.)
            handleServerMessage(data);
          }
        } else if (data.action === "file_uploaded") {
          // Parse file upload response
          const fileData =
            typeof data.message.content === "string"
              ? JSON.parse(data.message.content)
              : data.message.content;

          // Add the new file to workspace files
          setWorkspaceFiles((prevFiles) => [
            ...prevFiles,
            ...fileData.files,
          ]);
        } else if (data.action === "revert_complete") {
          const responseData = data.message;
          
          // Process the reverted file update
          if (responseData.type === "file" && responseData.content) {
            const fileContent = typeof responseData.content === 'string'
              ? JSON.parse(responseData.content)
              : responseData.content;
  
            
            // Update file in basedFiles list
            if (fileContent.based_filename && fileContent.based_content) {
              setBasedFiles(prevFiles => {
                  // Check if the file already exists
                  const existingFileIndex = prevFiles.findIndex(
                      file => file.name === fileContent.based_filename
                  );
          
                  const currentTimestamp = new Date().toISOString();
          
                  if (existingFileIndex >= 0) {
                      // Update existing file
                      const updatedFiles = [...prevFiles];
                      const updatedFile = {...updatedFiles[existingFileIndex]};
                      
                      // Create a new version
                      const newVersion: ChatFileBasedVersion = {
                      version_id: `v-${Date.now()}`,
                      diff: fileContent.based_content,
                      timestamp: currentTimestamp
                      };
                      
                      // Add to versions array and update latest content
                      updatedFile.latest_content = fileContent.based_content;
                      updatedFile.versions = [...updatedFile.versions, newVersion];
                      
                      updatedFiles[existingFileIndex] = updatedFile;
                      
                      return updatedFiles;
                  } else {
                      // Add new file with initial version
                      return [...prevFiles, {
                      file_id: `file-${Date.now()}`,
                      name: fileContent.based_filename,
                      latest_content: fileContent.based_content,
                      versions: [{
                          version_id: `v-${Date.now()}`,
                          diff: fileContent.based_content,
                          timestamp: currentTimestamp
                      }],
                      type: "based"
                      } as ChatFileBased];
                  }
              })
              
              // Update the editor if this is the currently selected file
              if (selectedBasedFileName === fileContent.based_filename) {
                setSelectedBasedFileContent(fileContent.based_content);
              }
            }
          }
        } else if (data.action === "selected_tools") {
          // Open the workspace panel with integrations tab
          // (Depending on your implementation this could be done by switching the appropriate panel state)
          // For example, if you store the active panel as localActivePanel, switch it to "integrations"
          setWorkspacePanelOpen(true);
          setLocalActivePanel("workspace");
          setIsFileAnimating(true)
          // add a 0.5 second delay to allow the panel to open
          setTimeout(() => {
            setLocalActivePanel("integrations");
          }, 500);
          
          // Save the selected tools coming from the server
          setSelectedTools(data.tools); // data.tools is an array of tool names
        
          // Start an iteration animation over all integration cards.
          // Assume tools (from your utils.ts) is available here.
          let index = 0;
          const interval = setInterval(() => {
            setAnimatedToolIndex(index);
            index++;
            if (index >= tools.length) {
              clearInterval(interval);
              // Reset the animated index so the final style can be applied
              setAnimatedToolIndex(null);
            }
          }, 80); // animate each card for 200ms
        } 
        // else {
        //   // Handle other message types
        //   handleServerMessage(data);
        // }
      } catch (err) {
        console.error("Error parsing WebSocket message", err);

        // If parsing fails, it might be a plain text message
        if (typeof event.data === "string") {
          setMessages((prev) => [
            ...prev,
            {
              type: "text",
              role: "assistant",
              content: event.data,
            },
          ]);
        }
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
      setConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [chatId]);

  // Add this useEffect for authentication rehydration
  useEffect(() => {
    const rehydrateAuth = async () => {
      const authResponse = localStorage.getItem("authResponse");

      if (authResponse) {
        try {
          const authObj = JSON.parse(authResponse);
          console.log("Rehydrating auth response:", authObj);
          const parsedEmail = authObj.email;
          const res = await fetch(`${BACKEND_BASE_URL}auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: parsedEmail }),
          });

          if (!res.ok) {
            throw new Error(`Login request failed: ${res.status}`);
          }

          const data = await res.json();
          console.log("Login response:", data);
          setAuthResponse(data);
        } catch (error) {
          console.error(error);
          // Clear invalid auth data
          localStorage.removeItem("authResponse");
        }
      }
    };

    rehydrateAuth();
  }, []);

  // Handle different types of server messages
  const handleServerMessage = (data: any) => {
    switch (data.type) {
      // case "status":
      //   setMessages((prev) => [
      //     ...prev,
      //     {
      //       type: "status",
      //       role: "assistant",
      //       content: data.message,
      //     },
      //   ]);
      //   break;

      case "executing_code":
        setMessages((prev) => [
          ...prev,
          {
            type: "code",
            uid: data.uid,
            filename: data.filename,
            role: "assistant",
            content: data.code,
            language: "typescript",
          },
        ]);
        break;

      case "code_result":
        setMessages((prev) => [
          ...prev,
          {
            type: "result",
            uid: data.uid,
            filename: data.filename,
            role: "assistant",
            content: JSON.stringify(data.result, null, 2),
          },
        ]);
        break;

      case "ai_response":
        // Check if the response contains steps
        const steps = parseSteps(data.content);

        // Check if the response contains code blocks
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let lastIndex = 0;
        let match;
        const newMessages: Message[] = [];

        // If we have steps, add them as a special message type
        if (steps) {
          // Add the content before the steps
          const stepsStart = data.content.indexOf("<steps>");
          if (stepsStart > 0) {
            const textBefore = data.content.slice(0, stepsStart).trim();
            if (textBefore) {
              newMessages.push({
                type: "text",
                role: "assistant",
                content: textBefore,
              });
            }
          }

          // Add the steps as a special message
          newMessages.push({
            type: "text",
            role: "assistant",
            content: data.content.match(/<steps>([\s\S]*?)<\/steps>/)[0],
          });

          // Add the content after the steps
          const stepsEnd = data.content.indexOf("</steps>") + "</steps>".length;
          if (stepsEnd < data.content.length) {
            const textAfter = data.content.slice(stepsEnd).trim();
            if (textAfter) {
              newMessages.push({
                type: "text",
                role: "assistant",
                content: textAfter,
              });
            }
          }
        } else {
          while ((match = codeBlockRegex.exec(data.content)) !== null) {
            // Add text before code block if exists
            const textBefore = data.content
              .slice(lastIndex, match.index)
              .trim();
            if (textBefore) {
              newMessages.push({
                type: "text",
                role: "assistant",
                content: textBefore,
              });
            }

            // Add code block
            newMessages.push({
              type: "code",
              role: "assistant",
              content: match[2]
                .trim()
                .replace("<think>research_complete: true</think>", ""),
              language: match[1] || "typescript",
            });

            lastIndex = match.index + match[0].length;
          }

          // Add remaining text after last code block
          const textAfter = data.content.slice(lastIndex).trim();
          if (textAfter) {
            newMessages.push({
              type: "text",
              role: "assistant",
              content: textAfter,
            });
          }

          // If no code blocks were found, add the entire response as text
          if (newMessages.length === 0) {
            newMessages.push({
              type: "text",
              role: "assistant",
              content: data.content,
            });
          }
        }

        setMessages((prev) => [...prev, ...newMessages]);
        break;

      case "executing_code":
        setMessages((prev) => [
          ...prev,
          {
            type: "code",
            role: "assistant",
            content: data.code,
            language: "typescript",
          },
        ]);
        break;

      case "code_result":
        setMessages((prev) => [
          ...prev,
          {
            type: "result",
            role: "assistant",
            content:
              typeof data.result === "object"
                ? JSON.stringify(data.result, null, 2)
                : data.result,
          },
        ]);
        break;

      case "error":
        setMessages((prev) => [
          ...prev,
          {
            type: "error",
            role: "assistant",
            content: data.message,
          },
        ]);
        break;

      default:
        console.log("Unknown message type:", data.type);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Ensure WebSocket connection is active before sending
  const ensureWebSocket = (): Promise<void> => {
    return new Promise((resolve) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        resolve();
      } else {
        // Reconnect if needed
        const ws = new WebSocket(`${BACKEND_BASE_URL}ws/${chatId}`);

        ws.onopen = () => {
          setSocket(ws);
          setConnected(true);
          resolve();
        };

        ws.onmessage = (event) => {
          // Reuse the same message handling logic
          try {
            const data = JSON.parse(event.data);
            handleServerMessage(data);
          } catch (err) {
            console.error("Error parsing WebSocket message", err);
          }
        };

        ws.onclose = () => {
          setConnected(false);
        };
      }
    });
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);

    // Add user message to chat history immediately for better UX
    const userMessage: Message = {
      type: "text",
      role: "user",
      content: inputValue,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Ensure WebSocket connection is active
    await ensureWebSocket();

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected.");
      setIsLoading(false);
      return;
    }

    try {
      
      const messageData = {
        action: "new_message",
        prompt: inputValue,
        model: model,
        is_first_prompt: workspaceFiles.length === 0 || messages.length === 0,
        selected_filename: selectedBasedFileName || "",
        chat_files_based: basedFiles,
      };  
      
      console.log("Sending message:", messageData);

      toast({
        description: "Kafka is thinking",
      });

      socket.send(JSON.stringify(messageData));
      setInputValue("");
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          role: "assistant",
          content: "Sorry, I encountered an error processing your request.",
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderMessage = (message: Message) => {
    // Check if the message contains steps
    // console.log("MESSAGE", message);
    const stepsMatch = message.content?.match(/<steps>([\s\S]*?)<\/steps>/);

    /* if the message is of type code, see if there is a message with type result that has the same uid */
    var resultMessage: Message | null = null;
    if (message.type === "code") {
      resultMessage = messages.find(
        (m) => m.type === "result" && m.uid === message.uid
      );
    }

    /* if the message has content of type <based></based> don't render it */
    if (message.content?.includes("<based>")) {
      return null;
    }

    if (message.content?.includes('"result"')) {
      return null;
    }

    if (message.type === "result") {
      return null;
    }

    message.content?.replace("<think>research_complete: true</think>", "");

    return (
      <div
        className={`flex items-start gap-4 ${
          message.role === "assistant" ? "bg-card" : "bg-muted/30"
        } p-6 rounded-none`}
      >
        <div
          className={`w-8 h-8 rounded-none flex items-center justify-center ${
            message.role === "assistant" ? "bg-blue-500" : "bg-foreground"
          }`}
        >
          {message.role === "assistant" ? (
            <Bot className="w-5 h-5 text-white" />
          ) : (
            <User className="w-5 h-5 text-background" />
          )}
        </div>
        <div className="flex-1 space-y-2 w-fulls">
          <div className="font-medium">
            {message.role === "assistant" ? "Assistant" : "You"}
          </div>
          {message.type === "code" ? (
            <CodeShower
              code={message.content}
              language={message.language}
              results={resultMessage?.content}
              filename="index.ts"
            />
          ) : message.type === "error" ? (
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-red-500">
              {message.content}
            </div>
          ) : stepsMatch ? (
            <div className="text-sm leading-relaxed">
              {message.content.split(stepsMatch[0])[0]}
              <div className="my-4 space-y-2 border rounded-md p-4 bg-muted/20">
                {parseSteps(message.content)?.map(
                  (step: any, index: any, array: any) => {
                    const isLast = index === array.length - 1;
                    const isLastAtLevel = array
                      .slice(index + 1)
                      .every((s: any) => s.indentLevel !== step.indentLevel);

                    // Create tree-like structure with connecting lines
                    const getTreeLine = () => {
                      if (step.indentLevel === 0) return null;

                      if (isLastAtLevel) {
                        return (
                          <span className="text-muted-foreground/40 mr-1">
                            └─
                          </span>
                        );
                      } else {
                        return (
                          <span className="text-muted-foreground/40 mr-1">
                            ├─
                          </span>
                        );
                      }
                    };

                    // Add vertical connecting lines for parent items
                    const getVerticalLines = () => {
                      if (step.indentLevel === 0) return null;

                      const lines = [];
                      for (let i = 0; i < step.indentLevel - 1; i++) {
                        // Check if we need a vertical line at this position
                        const needsLine = array
                          .slice(index + 1)
                          .some((s: any) => s.indentLevel > i);

                        lines.push(
                          <span
                            key={i}
                            className="inline-block w-6 text-center"
                          >
                            {needsLine ? (
                              <span className="text-muted-foreground/40">
                                │
                              </span>
                            ) : (
                              <span>&nbsp;</span>
                            )}
                          </span>
                        );
                      }
                      return <>{lines}</>;
                    };

                    return (
                      <div key={index} className="flex items-start">
                        <div className="flex items-center">
                          {getVerticalLines()}
                          {getTreeLine()}
                          <Checkbox className="border-gray-300/50 text-primary/70 focus:ring-primary/50" />
                        </div>
                        <span className="ml-2 text-muted-foreground/90">
                          {step.text}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
              {message.content.split(stepsMatch[0])[1] || ""}
            </div>
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
          )}
        </div>
      </div>
    );
  };

  const uploadFile = (file: FileItem) => {
    // Add the file to the workspace files
    setWorkspaceFiles((prev) => [...prev, file]);

    // Update the files in Supabase if we have a session
    if (chatId) {
      const updatedFiles = [...workspaceFiles, file];
      updateWorkspaceFiles(chatId, updatedFiles);
    }
  };

  // Add login handler
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const res = await fetch(`${BACKEND_BASE_URL}auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error(`Login request failed: ${res.status}`);
      }

      const data = await res.json();
      console.log("Login response:", data);

      // Save the auth response in localStorage
      localStorage.setItem("authResponse", JSON.stringify(data));
      setAuthResponse(data);
    } catch (error) {
      console.error(error);
      // TODO: show error to user
    }
  };

  

  // Get the list of chats from the first workspace
  // const chats = authResponse?.workspaces?.[0]?.chats || [];

  // Determine the index of the current chat in the list
  const currentChatIndex = chatlist.findIndex((chat: any) => chat.id === chatId);

  // Switch to the previous chat (wraps around)
  const handlePrevChat = () => {
    if (chatlist.length > 0) {
      const newIndex = currentChatIndex > 0 ? currentChatIndex - 1 : chatlist.length - 1;
      handleChatSwitch(chatlist[newIndex].id);
    }
  };

  // Switch to the next chat (wraps around)
  const handleNextChat = () => {
    if (chatlist.length > 0) {
      const newIndex = currentChatIndex < chatlist.length - 1 ? currentChatIndex + 1 : 0;
      handleChatSwitch(chatlist[newIndex].id);
    }
  };

  // Add the handleChatSwitch function inside the Home component
  const handleChatSwitch = (newChatId: string) => {
    setChatId(newChatId);
    // Update URL with new chat ID
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("chatId", newChatId);
    window.history.pushState({}, "", newUrl);
    console.log("Switched to chat with ID:", newChatId);
    const currentChat = chatlist.find((chat: any) => chat.id === chatId);
    setChatName(currentChat?.name || "");
  };

  const handleAddNewModel = async (userId: string, newModelName: string, newModelAk: string, newModelBaseUrl: string) => {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("name", newModelName);
    formData.append("ak", newModelAk);
    formData.append("base_url", newModelBaseUrl);
  
    try {
      const res = await fetch(`${BACKEND_BASE_URL}models/new`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`Add model failed with status ${res.status}`);
      }
      const data = await res.json();
      console.log("New model response:", data);
      setModel(data.name);

      setModelList((prev) => [...prev, data]);

      toast({
        title: "Model added",
        description: `${newModelName} has been added successfully`,
        variant: "default",
      })

    } catch (error) {
      console.error("Error adding new model:", error);
    }
  }

  const handleDeleteModel = async (modelId: string) => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}models/delete/${modelId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Delete model failed with status ${res.status}`);
      }
      const data = await res.json();
      console.log("Delete model response:", data);
      // Remove the deleted model from state.
      setModelList((prevModels) => prevModels.filter((model) => model.id !== modelId));

      toast({
        title: "Model deleted",
        description: `Model has been deleted successfully`,
        variant: "destructive",
      })
    } catch (error) {
      console.error("Error deleting model:", error);
    }
  };

  const handleRenameChat = async (chatId: string, newName: string) => {
    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("new_name", newName);

    try {
      const res = await fetch(`${BACKEND_BASE_URL}chat/rename`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`Rename chat failed with status ${res.status}`);
      }
      const data = await res.json();
      console.log("Rename chat response:", data);

      setChatlist((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.id === chatId) {
            return { ...chat, name: newName };
          }
          return chat;
        });
      })
      
      
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}chat/${chatId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Delete chat failed with status ${res.status}`);
      }
      const data = await res.json();
      console.log("Delete chat response:", data);

      toast({
        title: "Chat deleted",
        description: "Chat has been deleted successfully",
        variant: "destructive",
      });
      
      setChatlist((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground text-sm flex flex-col h-screen overflow-hidden">
      {!authResponse ? (
        <div className="dark min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-neutral-100">
          <Card className="w-full max-w-md mx-auto bg-neutral-950 rounded-none">
            <CardHeader>
              <CardTitle className="text-xl">Sign in</CardTitle>
              <CardDescription>Enter your email to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="someone@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full mt-4 bg-blue-200">
                  Sign in
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-neutral-500">
                Enter your email address to register or log in.
              </p>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <>
          <nav className="h-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 relative">
            <div className="container h-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-48 rounded-none text-[12px]"
                    >
                      <ScrollArea className="max-h-[50vh] h-fit">
                        {chatlist.length > 0 ? (
                          [...chatlist].reverse().map((chat: any) => (
                          <DropdownMenuItem
                            key={chat.id}
                            className="group flex items-center justify-between rounded-none text-[12px] font-medium overflow-hidden"
                            onClick={() => handleChatSwitch(chat.id)}
                          >
                            <span>{chat.name}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                            <Trash
                              className="w-4 h-4 text-red-500 cursor-pointer"
                              onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(chat.id);
                              }}
                            />
                            <Edit3
                              className="w-4 h-4 text-blue-500 cursor-pointer"
                              onClick={(e) => {
                              e.stopPropagation();
                              setChatToRename(chat);
                              setNewChatName(chat.name);
                              setShowRenameDialog(true);
                              }}
                            />
                            </div>
                          </DropdownMenuItem>
                          ))
                        ) : (
                          <DropdownMenuItem disabled>No chats available</DropdownMenuItem>
                        )}
                      </ScrollArea>
                    </DropdownMenuContent>
                    <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Rename Chat</DialogTitle>
                        <DialogDescription>
                          Enter a new name for the chat.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Input
                          placeholder="New Chat Name"
                          value={newChatName}
                          onChange={(e) => setNewChatName(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={async () => {
                            if (chatToRename) {
                              await handleRenameChat(chatToRename.id, newChatName);
                            }
                            setShowRenameDialog(false);
                          }}
                        >
                          Save
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  </DropdownMenu>

                <span className="text-sm font-semibold">Kafka</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handlePrevChat}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNextChat}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2 px-2">
                  <div className="h-4 w-4 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium">
                    {chatName}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Square className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <History className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="px-2 py-1 h-6 rounded-none text-[12px] font-medium"
                    >
                      <Rocket className="h-4 w-4" />
                      <span className="ml-2">Deploy your agent</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 rounded-none text-[12px]"
                  >
                    <DropdownMenuItem className="cursor-pointer rounded-none text-[12px] font-medium">
                      <Code2 className="h-4 w-4 mr-2" />
                      <span>Deploy as API</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-none text-[12px] font-medium">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      <span>Deploy to Chat</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-none text-[12px] font-medium">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>Deploy to Phone</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-none text-[12px] font-medium">
                      <Slack className="h-4 w-4 mr-2" />
                      <span>Deploy to Slack</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-none text-[12px] font-medium">
                      <Video className="h-4 w-4 mr-2" />
                      <span>Deploy to Zoom</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="px-2 py-1 rounded-none text-[12px] font-medium">
                      <span>{model || (modelList[0] ?? "Select Model")}</span>
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-none text-[12px] w-fit">
                    {modelList.length > 0 ? (
                      modelList.map((m) => (
                        <DropdownMenuItem 
                          key={m.id}
                          // Use group to enable hover styles for the inner delete icon
                          className="group flex items-center justify-between"
                          onClick={() => setModel(m.name)}
                        >
                          <span>{m.name}</span>
                          <Trash 
                            className="w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();  // prevent parent onClick from firing
                              handleDeleteModel(m.id);
                            }}
                          />
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>No models available</DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowAddModelDialog(true)}>
                      Add Model
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={showAddModelDialog} onOpenChange={setShowAddModelDialog}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Model</DialogTitle>
                      <DialogDescription>
                        Enter the model name. The base URL and API key are taken from environment variables.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input
                        placeholder="Model Name"
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddModelDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={async () => {
                          await handleAddNewModel(
                            authResponse?.user_id || "",
                            newModelName,
                            defaultModel.ak!,
                            defaultModel.base_url!
                          );
                          console.log("New model added:", newModelName);
                          setModel(newModelName);
                          setNewModelName("");
                          setShowAddModelDialog(false);
                        }}
                      >
                        Add Model
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setWorkspacePanelOpen(!workspacePanelOpen)}
                >
                  <PanelRightOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </nav>

          <ResizablePanelGroup
            id="main-panel"
            direction="horizontal"
            className="h-[calc(100vh-2.5rem)]"
          >
            <ResizablePanel
              defaultSize={workspacePanelOpen ? 40 : 100}
              minSize={30}
            >
              <div className="container mx-auto px-4 py-8 h-full overflow-auto relative">
                <div className="space-y-6 pb-32">
                  {messages.map((message, index) => (
                    <div key={index}>{renderMessage(message)}</div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[640px] max-w-[calc(100%-32px)] z-50">
                  <div className="bg-background/80 backdrop-blur-xl rounded-none border shadow-lg">
                    {!connected && (
                      <div className="p-2 bg-red-500/10 text-red-500 text-xs text-center">
                        Disconnected from server. Please refresh the page.
                      </div>
                    )}
                    <div className="p-4">
                      <ChatInput
                        value={inputValue}
                        onChange={setInputValue}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        disabled={!connected}
                        workspaceFiles={workspaceFiles}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>

            {workspacePanelOpen && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={60} minSize={20}>
                  <WorkspacePanel
                  isOpen={true}
                  onClose={() => setWorkspacePanelOpen(false)}
                  workspaceId={authResponse?.workspaces[0]?.id}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  inputfiles={
                    workspaceFiles?.length > 0
                    ? workspaceFiles
                    : []
                  }
                  setWorkspaceFiles={setWorkspaceFiles}
                  basedFiles={basedFiles}
                  setSelectedBasedFileName={setSelectedBasedFileName}
                  wsRef={wsRef}
                  setBasedFiles={setBasedFiles}
                  setSelectedBasedFileContent={setSelectedBasedFileContent}
                  selectedBasedFileName={selectedBasedFileName}
                  localActivePanel={localActivePanel}
                  setLocalActivePanel={setLocalActivePanel}
                  selectedTools={selectedTools}
                  animatedToolIndex={animatedToolIndex}
                  />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </>
      )}
    </main>
  );
}
