"use client";

import { useState, useRef, useEffect } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  File,
  FileText,
  FileCode,
  FileSpreadsheet,
  Folder,
  PanelRightClose,
  X,
  Upload,
  Download,
  Brain,
  FilesIcon,
  Bolt,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Table } from "@/components/ui/table";
import { uploadToS3 } from "@/lib/s3/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { tools } from "@/lib/utils";
import {
  Mail,
  MailSearch,
  PlusSquare,
  Trash2,
  Edit,
  Search,
  Eraser,
  CalendarClock,
  UserPlus,
  MessageSquare,
  MessageCircle,
  Database,
  FilePlus,
  Pencil,
  Package,
  User,
  Smartphone,
  PhoneCall,
  Save,
  Filter,
  MessageCircleQuestion,
  Link as LucideLink,
  Eye,
  Table as LucideTable,
  Globe,
  Code2,
  Network,
  Send,
  Trash,
  History
} from "lucide-react";
import { BACKEND_BASE_URL } from "@/lib/utils";
import Editor from 'react-simple-code-editor';
// @ts-ignore
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-solarizedlight.css'; 
import VersionDiffExplorer from "../versionDiffExplorer/versionDiffExplorer";
import { ChatFileBased } from "../versionDiffExplorer/versionDiffExplorer";
  export interface FileItem {
    id: string;
    name: string;
    content: string;
    language: string;
    type: "code" | "pdf" | "csv" | "markdown" | "other" | "computer" | "image" | "based";
    url: string;
    versions?: FileVersion[];
  }

  export interface FileVersion {
    version_id: string;
    timestamp: string;
    diff: string;
  }



const iconMap: Record<string, React.ReactNode> = {
  Mail: <Mail className="h-20 w-20" />,
  MailSearch: <MailSearch className="h-20 w-20" />,
  PlusSquare: <PlusSquare className="h-20 w-20" />,
  Trash2: <Trash2 className="h-20 w-20" />,
  Edit: <Edit className="h-20 w-20" />,
  Search: <Search className="h-20 w-20" />,
  Eraser: <Eraser className="h-20 w-20" />,
  CalendarClock: <CalendarClock className="h-20 w-20" />,
  UserPlus: <UserPlus className="h-20 w-20" />,
  MessageSquare: <MessageSquare className="h-20 w-20" />,
  MessageCircle: <MessageCircle className="h-20 w-20" />,
  ThumbsUpDown: <ThumbsUp className="h-20 w-20" />,
  Database: <Database className="h-20 w-20" />,
  FilePlus: <FilePlus className="h-20 w-20" />,
  Pencil: <Pencil className="h-20 w-20" />,
  Package: <Package className="h-20 w-20" />,
  User: <User className="h-20 w-20" />,
  Smartphone: <Smartphone className="h-20 w-20" />,
  PhoneCall: <PhoneCall className="h-20 w-20" />,
  Save: <Save className="h-20 w-20" />,
  Filter: <Filter className="h-20 w-20" />,
  MessageQuestion: <MessageCircleQuestion className="h-20 w-20" />,
  Link: <LucideLink className="h-20 w-20" />,
  Eye: <Eye className="h-20 w-20" />,
  Table: <LucideTable className="h-20 w-20" />,
  Globe: <Globe className="h-20 w-20" />,
  Code2: <Code2 className="h-20 w-20" />,
  FileText: <FileText className="h-20 w-20" />,
  Network: <Network className="h-20 w-20" />,
  Send: <Send className="h-20 w-20" />
};
// Helper function to determine file type from extension
const getFileType = (
  filename: string
): "code" | "pdf" | "csv" | "markdown" | "other" | "computer" | "image" => {
  const extension = filename?.split(".").pop()?.toLowerCase();

  if (
    [
      "js",
      "jsx",
      "ts",
      "tsx",
      "css",
      "html",
      "json",
      "py",
      "java",
      "c",
      "cpp",
    ].includes(extension || "")
  ) {
    return "code";
  } else if (extension === "pdf") {
    return "pdf";
  } else if (extension === "csv") {
    return "csv";
  } else if (extension === "md") {
    return "markdown";
  } else if (
    ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")
  ) {
    return "image";
  }

  return "other";
};

// Helper function to get the appropriate icon for a file
const FileIcon = ({ filename }: { filename: string }) => {
  const extension = filename?.split(".").pop()?.toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")) {
    return <FileText className="h-3.5 w-3.5" />;
  }

  switch (extension) {
    case "pdf":
      return <FileText className="h-3.5 w-3.5" />;
    case "csv":
      return <FileSpreadsheet className="h-3.5 w-3.5" />;
    case "md":
      return <FileText className="h-3.5 w-3.5" />;
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "html":
    case "css":
    case "json":
    case "py":
      return <FileCode className="h-3.5 w-3.5" />;
    default:
      return <File className="h-3.5 w-3.5" />;
  }
};

// CSV renderer component
const CsvViewer = ({ content }: { content: string }) => {
  const rows = content
    .trim()
    .split("\n")
    .map((line) => line.split(","));
  const headers = rows[0] || [];
  const data = rows.slice(1);

  return (
    <div className="p-4">
      <Table>
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th key={i}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

// File content renderer based on file type
// Modified FileContentRenderer component with horizontal scrolling for code blocks
const FileContentRenderer = ({ file }: { file: FileItem }) => {
  switch (file.type) {
    case "image":
      return (
        <div className="flex items-center justify-center h-full p-4">
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    case "pdf":
      return (
        <div className="flex items-center justify-center h-full p-4">
          {file.url ? (
            <iframe
              src={file.url}
              className="w-full h-full border"
              title={file.name}
            />
          ) : (
            <iframe
              src={`data:application/pdf;base64,${btoa(file.content)}`}
              className="w-full h-full border"
              title={file.name}
            />
          )}
        </div>
      );
    case "csv":
      return <CsvViewer content={file.content} />;
    case "markdown":
      return (
        <div className="p-4 prose prose-sm max-w-none">
          <ReactMarkdown>{file.content}</ReactMarkdown>
        </div>
      );
    case "computer":
      return (
        <div className="flex items-center justify-center h-full p-4">
          <iframe
            src={file.url}
            className="w-full h-full border"
            title={file.name}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            referrerPolicy="no-referrer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      );
    case "code":
      return (
        <div className="p-4">
          <Editor
            value={file.content}
            onValueChange={() => {}}
            highlight={code => highlight(code, languages.js)}
            padding={10}
            // style={{
            //     fontSize: 12,
            //     outline: "none",
            //     border: "none",
            //     height: "100%"
            // }}
          />
        </div>
      );
    case "based":
      return (
        <div className="p-4">
          <Editor
            value={file.content}
            onValueChange={() => {}}
            highlight={code => highlight(code, languages.js)}
            padding={10}
            // style={{
            //     fontSize: 12,
            //     outline: "none",
            //     border: "none",
            //     height: "100%"
            // }}
          />
        </div>
      );
    default:
      // For code or other text content that needs horizontal scrolling
      return (
        <div className="p-4 flex">
          <pre className="text-xs font-mono whitespace-pre w-max break-all">{file.content}</pre>
        </div>
      );
  }
};


interface WorkspacePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload?: (file: FileItem) => void;
  activePanel?: "workspace" | "agent" | "integrations";
  onPanelChange?: (panel: "workspace" | "agent" | "integrations") => void;
  workspaceId: string;
  inputfiles: FileItem[];
  activeTab: string | null; // now passed from parent
  setActiveTab: React.Dispatch<React.SetStateAction<string | null>>; // passed setter
  setWorkspaceFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  basedFiles: ChatFileBased[];
  setSelectedBasedFileName: React.Dispatch<React.SetStateAction<string>>;
  wsRef?: React.MutableRefObject<WebSocket | null>;
  setBasedFiles: React.Dispatch<React.SetStateAction<ChatFileBased[]>>;
  setSelectedBasedFileContent: React.Dispatch<React.SetStateAction<string>>;
  selectedBasedFileName: string;
  localActivePanel: "workspace" | "agent" | "integrations";
  setLocalActivePanel: React.Dispatch<React.SetStateAction<"workspace" | "agent" | "integrations">>;
  selectedTools?: string[];
  animatedToolIndex?: number | null;
}

interface FileType {
  id: string;
  filename: string;
}

export function WorkspacePanel({
  isOpen,
  onClose,
  onFileUpload,
  workspaceId,
  inputfiles,
  activeTab,
  setActiveTab,
  setWorkspaceFiles,
  basedFiles,
  setSelectedBasedFileName,
  wsRef,
  setBasedFiles,
  setSelectedBasedFileContent,
  localActivePanel,
  setLocalActivePanel,
  selectedBasedFileName,
  selectedTools,
  animatedToolIndex
}: WorkspacePanelProps) {
  const [files, setFiles] = useState<FileItem[]>(inputfiles || []);
  //const [allFiles, setAllFiles] = useState<FileItem[]>(inputfiles || []);

  const allFiles = inputfiles;

  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();

  // Add these new state variables for the chat functionality
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add these new state variables for drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [showVersionExplorer, setShowVersionExplorer] = useState(false);
  const [selectedBasedFile, setSelectedBasedFile] = useState<FileItem | null>(null);

  const openVersionExplorer = (file: FileItem) => {
    setSelectedBasedFile(file);
    setSelectedBasedFileName(file.name);
    setShowVersionExplorer(true);
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const chatId = url.searchParams.get("chatId");
    console.log("Chat ID:", chatId);
    console.log('FILES', files);

    if (!chatId) return;
    setChatId(chatId);
  }, [chatId, files]);

  useEffect(() => {
    // whenever the files are not in allFiles, it means the files are from an old chat, and should be removed
    const updatedFiles = files.filter((file) =>
      allFiles.some((allFile) => allFile.id === file.id)
    );
    if (updatedFiles.length !== files.length) {
      setFiles(updatedFiles);
      setShowVersionExplorer(false);
      setActiveTab(null);
      console.log("files hav ebeen updated")
    }
  }, [files, allFiles]);
  

  // Add this effect to scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // This determines which top-level panel is shown
  const handlePanelChange = (panel: "workspace" | "agent" | "integrations") => {
    setLocalActivePanel(panel);
  };

  // This handles file tab changes within the workspace panel
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTab === id) {
      const remainingFiles = files.filter((file) => file.id !== id);
      setActiveTab(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
    setFiles(files.filter((file) => file.id !== id));
  };

  useEffect(() => {
    if (selectedBasedFileName) {
      const existingFile = allFiles.find((f) => f.name === selectedBasedFileName);
      if (existingFile) {
        handleOpenFile(existingFile);
      }
    }
  }, [selectedBasedFileName, allFiles]);

  const toolRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!animatedToolIndex) {
      return;
    }
    if (animatedToolIndex !== null) {
      const el = toolRefs.current[animatedToolIndex];
      el?.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
  }, [animatedToolIndex]);

  // Add function to open a file from the explorer
  const handleOpenFile = async (file: FileItem) => {

    setShowVersionExplorer(false);
    
    

    const existingFile = files.find((f) => f.id === file.id);
    if (existingFile) {
      setActiveTab(file.id);
      return;
    }

    // If the file has a URL but no content, fetch the content
    let fileToAdd = file;
    // if filename includes .based, it's a based file, and is handled differently
    if (file.name.includes(".based")){
      setSelectedBasedFileName(file.name);
      fileToAdd = file
    } else if (file.url) {
      try {
        // Check if the URL is an S3 URL that might need signing
        if (file.url.includes("s3.") && file.url.includes("amazonaws.com")) {
          // Get a signed URL for the file to ensure access
          const signedUrlResponse = await fetch("/api/s3/sign-get", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              key: file.id, // Using the file ID as the S3 key
              contentType:
                file.type === "pdf"
                  ? "application/pdf"
                  : file.type === "csv"
                  ? "text/csv"
                  : file.type === "markdown"
                  ? "text/markdown"
                  : "text/plain",
            }),
          });

          if (signedUrlResponse) {
            const { signedUrl } = await signedUrlResponse.json();
            // Use the signed URL for fetching
            const response = await fetch(signedUrl);
            if (response.ok) {
              const content = await response.text();
              fileToAdd = { ...file, content, url: signedUrl };
            }
          } else {
            // Fall back to the original URL if signing fails
            const response = await fetch(file.url);
            if (response.ok) {
              const content = await response.text();
              fileToAdd = { ...file, content, url: file.url };
            }
          }
        } else {
          // For non-S3 URLs, fetch directly
          const response = await fetch(file.url);
          if (response.ok) {
            const content = await response.text();
            fileToAdd = { ...file, content };
          }
        }
      } catch (error) {
        console.error("Failed to fetch file content:", error);
        toast({
          title: "Error loading file",
          description: "Could not load the file content from URL.",
          variant: "destructive",
        });
      }
    }
    setFiles([...files, fileToAdd]);
    setActiveTab(file.id);
    setShowVersionExplorer(false);
  };

  // Add these handlers for drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    // Process each dropped file
    for (const file of droppedFiles) {
      // Check if file type is supported
      const fileType = getFileType(file.name);
      if (!["pdf", "csv", "markdown", "code", "image"].includes(fileType)) {
        toast({
          title: "Unsupported file type",
          description:
            "Only images, PDF, CSV, Markdown, and code files are supported.",
          variant: "destructive",
        });
        continue;
      }

      try {
        setIsUploading(true);

        // Upload file to S3
        const result = await uploadToS3({
          file,
          directory: "",
          endpoint: "/api/s3/sign",
          onProgress: (progress) => {
            console.log(`Upload progress: ${progress}%`);
          },
        });

        // Read file content (for non-image files)
        let fileContent = "";
        if (fileType !== "image") {
          fileContent = await readFileContent(file);
        }

        // Create new file item
        const newFile: FileItem = {
          id: result.key,
          name: file.name,
          content: fileContent,
          language: fileType === "code" ? file.name.split(".").pop() || "" : "",
          type: fileType,
          url: result.url,
        };

        console.log("New file:", newFile);

        // Add file to workspace
        setAllFiles((prev) => [...prev, newFile]);
        setFiles((prev) => [...prev, newFile]);
        setActiveTab(newFile.id);

        // Call the onFileUpload prop if provided
        if (onFileUpload) {
          onFileUpload(newFile);
        }

        toast({
          title: "File uploaded",
          description: `${file.name} has been uploaded successfully.`,
        });
      } catch (error) {
        console.error("File upload failed:", error);
        toast({
          title: "Upload failed",
          description: "There was an error uploading your file.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Helper function to read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      if (file.type === "application/pdf") {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  // Add function to handle file download
  const handleDownloadFile = async (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();

    // Only allow downloading for based files
    if (!file.name.includes(".based")) {
      toast({
        title: "Download not supported",
        description: "Only based files can be downloaded.",
        variant: "destructive",
      });
      return;
    }

    // Use latest_content if available; fallback to file.content
    const fileContent = file.content;
    if (!fileContent) {
      toast({
        title: "No Content",
        description: "There is no content available for download.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a blob with the based file content
    const blob = new Blob([fileContent], { type: "text/plain" });
    const downloadUrl = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);

    toast({
      title: "Download started",
      description: `Downloading ${file.name}`,
    });
  };

  // Add this function to handle sending messages
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages([...messages, { role: "user", content: inputMessage }]);

    // Clear input
    setInputMessage("");

    // Simulate AI response (in a real app, you'd call your API here)
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "This is a simulated response. In a real application, this would be connected to your AI backend.",
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleUploadWorkspaceFile = async () => {
        // Create a hidden file input element.
        const fileInput = document.createElement("input");
        // console.log('created file input');
        fileInput.type = "file";
        fileInput.accept = ".pdf,.txt";
        fileInput.multiple = true;
        
        // When files are selected...
        fileInput.onchange = async () => {
          const selectedFiles = fileInput.files;
          if (selectedFiles && selectedFiles.length > 0) {
            // Build FormData with target_id, is_chat, and files.
            const formData = new FormData();
            // chat id is in the url
            const url = new URL(window.location.href);
            const chatId = url.searchParams.get("chatId");
            console.log("Chat ID:", chatId);
    
            if (!chatId) {
              console.error("Chat ID not found in URL");
              return;
            }
    
            console.log("Chat ID:", chatId);
            formData.append("target_id", chatId);
            formData.append("is_chat", "true"); // Uploading to workspace only  
            
            // Append each selected file to the FormData
            for (let i = 0; i < selectedFiles.length; i++) {
              formData.append("files", selectedFiles[i]);
    
              // Upload file to S3
              const result = await uploadToS3({
                file: selectedFiles[i],
                directory: "",
                endpoint: "/api/s3/sign",
                onProgress: (progress: any) => {
                  console.log(`Upload progress: ${progress}%`);
                },
              });
    
              console.log("S3 URL:", (result as any).url);
    
              formData.append("s3_urls", (result as any).url);
            }
            
            try {
              const res = await fetch(`${BACKEND_BASE_URL}file/upload`, {
                method: "POST",
                body: formData,
              });
              if (!res.ok) {
                throw new Error(`Upload failed with status ${res.status}`);
              }
              const data = await res.json();
              console.log("Upload response:", data);
    
              for (let i = 0; i < selectedFiles.length; i++) {
                setWorkspaceFiles((prev) => [...prev, data.files[i]]);
                setActiveTab(data.files[i].id);
                toast({
                  title: "File uploaded",
                  description: `${data.files[i].name} has been uploaded successfully.`,
                });
              }
              
            } catch (error) {
              console.error("Error uploading file:", error);
            }
          }
        };
        
        // Trigger the file dialog
        fileInput.click();
      };
  
  const handleDeleteFile = (fileId: string, event?: React.MouseEvent) => {
      if (event) {
      event.stopPropagation(); // Prevent the click from selecting the file
      }
  
      if (!wsRef || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected.");
      return;
      }


      // Find the file to be deleted
      const fileToDelete = basedFiles.find(file => file.file_id === fileId);
      
      const messageData = {
      action: "delete_file",
      file_id: fileId,
      };
      wsRef.current.send(JSON.stringify(messageData));
      
      
      
      // Update UI state
      setBasedFiles(prevFiles => prevFiles.filter(file => file.file_id !== fileId));
      
      // If the deleted file is currently selected, clear the selection or select another file
      if (fileToDelete && fileToDelete.name === selectedBasedFileName) {
      // Find the next file to select
      const remainingFiles = basedFiles.filter(file => file.file_id !== fileId);
      if (remainingFiles.length > 0) {
          // Select the first remaining file
          setSelectedBasedFileName(remainingFiles[0].name);
          setSelectedBasedFileContent(remainingFiles[0].latest_content);
      } else {
          // No files left, clear the selection
          setSelectedBasedFileName("");
          setSelectedBasedFileContent("");
      }
      }
    };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-0 border-b pr-2">
        <div className="flex space-x-0">
          <Button
            variant={localActivePanel === "agent" ? "default" : "ghost"}
            size="sm"
            onClick={() => handlePanelChange("agent")}
            className="text-xs font-medium rounded-none"
          >
            <Brain className="h-3.5 w-3.5" />
            <span className="ml-1.5">Agent</span>
          </Button>
          <Button
            variant={localActivePanel === "workspace" ? "default" : "ghost"}
            size="sm"
            onClick={() => handlePanelChange("workspace")}
            className="text-xs font-medium rounded-none"
          >
            <FilesIcon className="h-3.5 w-3.5" />
            <span className="ml-1.5">Workspace</span>
          </Button>
          <Button
            variant={localActivePanel === "integrations" ? "default" : "ghost"}
            size="sm"
            onClick={() => handlePanelChange("integrations")}
            className="text-xs font-medium rounded-none"
          >
            <Bolt className="h-3.5 w-3.5" />
            <span className="ml-1.5">Integrations</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </div>

      {localActivePanel === "workspace" && (
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full flex flex-col">
              <div className="p-2 border-b font-medium text-xs h-8">
                EXPLORER
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground">FILES</span>
                    <div className="relative">
                      {/* <input
                        type="file"
                        id="file-upload"
                        className="sr-only"
                        accept=".pdf,.csv,.md"
                        onDrop={handleDrop}
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="file-upload"
                        className={cn(
                          "cursor-pointer p-1 hover:bg-muted inline-flex items-center justify-center",
                          isUploading && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </label> */}
                      {/* <Button variant="outline" size="icon" onClick={handleUploadWorkspaceFile} className="cursor-pointer w-7 h-7">
                        <Upload className="h-3 w-3" />
                      </Button> */}
                    </div>
                  </div>
                  {allFiles.map((file) => (
                    <div
                      key={file.id}
                      className={cn(
                        "flex items-center gap-1 text-xs p-1 cursor-pointer hover:bg-muted",
                        activeTab === file.id && "bg-muted"
                      )}
                      onClick={() => handleOpenFile(file)}
                    >
                      <FileIcon filename={file.name} />
                      <span className="flex-1">{file.name}</span>
                      {file.name.includes(".based") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // prevent opening file tab
                            console.log("Opening version explorer");
                            openVersionExplorer(file);
                          }}
                          title="File History"
                        >
                          <History className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      <Button
                          onClick={(e) => handleDeleteFile(file.id, e)}
                          className="text-xs cursor-pointer m-0 p-1"
                          title="Delete file"
                          variant="ghost"
                      >
                          <Trash  className="h-3.5 w-3.5"/>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                        onClick={(e) => handleDownloadFile(file, e)}
                        title="Download file"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={70}>
            <div className="h-full flex flex-col">
              <Tabs
                value={activeTab || ""}
                onValueChange={handleTabChange}
                className="w-full flex flex-col h-8"
              >
                <div className="border-b h-8">
                  <ScrollArea orientation="horizontal" className="w-full">
                    <TabsList className="bg-transparent h-8 w-full justify-start">
                      {files.map((file) => (
                        <TabsTrigger
                          key={file.id}
                          value={file.id}
                          className="relative data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                        >
                          <FileIcon filename={file.name} />
                          <span className="ml-1.5 mr-1">{file.name}</span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloseTab(file.id, e);
                            }}
                            className="h-4 w-4 p-0 rounded-none cursor-pointer hover:opacity-100 opacity-70"
                          >
                            <X className="h-3 w-3" />
                          </span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </ScrollArea>
                </div>

                {files.map((file) => (
                  <TabsContent
                    key={file.id}
                    value={file.id}
                    className="flex-1 p-0 m-0 h-[100vh] w-full"
                  >
                    <ScrollArea className="h-full w-full">
                      {!showVersionExplorer && <FileContentRenderer file={file} />}
                      {showVersionExplorer && selectedBasedFile && (
                        <div className="h-full w-full flex">
                          <VersionDiffExplorer
                            basedFiles={basedFiles}
                            selectedBasedFileName={selectedBasedFile.name}
                            selectedBasedFileContent={selectedBasedFile.content}
                            // Optionally pass the websocket ref if needed
                            wsRef={wsRef}
                          />
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      {localActivePanel === "agent" && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <div key={index} className="flex flex-col">
                  <div
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[80%] ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-xs font-medium">
                          {message.role === "user" ? "U" : "AI"}
                        </div>
                      </Avatar>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add action buttons for AI messages outside the message box */}
                  {message.role === "assistant" && (
                    <div className="flex items-center mt-1 ml-10 gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Avatar className="h-8 w-8">
                      <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-xs font-medium">
                        AI
                      </div>
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <span className="text-sm">Typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t p-4">
            <form
              onSubmit={handleSendMessage}
              className="relative max-w-3xl mx-auto"
            >
              {/* Display uploaded files above textarea */}
              {files.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="bg-muted rounded-md px-2 py-1 text-xs flex items-center gap-1"
                    >
                      {file.type === "image" ? (
                        <div className="relative w-8 h-8 mr-1">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover rounded-sm"
                          />
                        </div>
                      ) : (
                        <FileIcon filename={file.name} />
                      )}
                      <span className="truncate max-w-[150px]">
                        {file.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => {
                          /* Handle removing file reference */
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div
                className="relative"
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isDragging && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">
                        Drop files here to upload
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports PDF, CSV, Markdown, and code files
                      </p>
                    </div>
                  </div>
                )}

                <Textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask anything or drop files here"
                  className="min-h-[120px] w-full resize-none pb-16 py-3 rounded-lg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />

                <div className="absolute bottom-0 left-0 right-0 px-2 flex justify-between items-center bg-background border border-t-0 rounded-b-lg py-1">
                  <div className="flex items-center gap-1">
                    {/* Left side buttons */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted"
                      onClick={() => {
                        // Open file upload dialog
                        document.getElementById("chat-file-upload")?.click();
                      }}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted"
                    >
                      <FilesIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted"
                    >
                      <Brain className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    size="icon"
                    className="h-8 w-8 rounded-sm bg-black text-white hover:bg-gray-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="h-4 w-4 m-1 text-white"
                      stroke="currentColor"
                    >
                      <path
                        d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </Button>
                </div>

                <input
                  type="file"
                  id="chat-file-upload"
                  className="sr-only"
                  accept=".pdf,.csv,.md,.js,.jsx,.ts,.tsx,.css,.html,.json,.py,.java,.c,.cpp,.jpg,.jpeg,.png,.gif,.webp,.svg"
                  onDrop={handleDrop}
                  disabled={isUploading}
                />
              </div>

              <div className="text-center text-xs text-gray-500 mt-2">
                Agents can make mistakes. Check important info.
              </div>
            </form>
          </div>
        </div>
      )}

      {localActivePanel === "integrations" && (
        <div className="flex-1 p-4">
          <div className="text-center text-muted-foreground flex flex-wrap overflow-y-scroll h-[calc(100vh-100px)]">
            {!selectedTools && tools.map((tool) => (
              <Card key={tool.name} className="p-4 flex-1 min-w-[300px] m-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between align">
                    {iconMap[tool.icon] || <FileText className="h-20 w-20" />}
                    <div className="text-sm text-right">{tool.name}</div>

                  </CardTitle>
                  <CardDescription className="text-left">{tool.shortDescription}</CardDescription>
                </CardHeader>
                {/* <CardContent>
                  <p>{tool.docs}</p>
                </CardContent> */}
              </Card>
            ))}
            {selectedTools && tools.map((tool, index) => {
              // During animation, if this card’s index matches animatedToolIndex, add a white border/highlight.
              const animationClass = animatedToolIndex === index ? "border-2 border-white" : "";
              // If the tool is in the selectedTools list, add a green background.
              const selectedClass = selectedTools.includes(tool.name) ? "bg-green-500 text-white" : "";
              return (
                <Card 
                  key={tool.name} 
                  ref={(el) => (toolRefs.current[index] = el)}
                  className={`p-4 flex-1 min-w-[300px] m-2 ${animationClass} ${selectedClass}`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {iconMap[tool.icon] || <FileText className="h-20 w-20" />}
                      <div className="text-sm text-right">{tool.name}</div>
                    </CardTitle>
                    <CardDescription className={selectedTools.includes(tool.name) ? "text-white text-left" : "text-left"}>{tool.shortDescription}</CardDescription>
                  </CardHeader>
                  {/* Optionally render docs or additional content */}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
