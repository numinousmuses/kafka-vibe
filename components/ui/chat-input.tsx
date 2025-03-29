"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, HelpCircle, Send, File, FileText, FileCode } from "lucide-react";
import { FileItem } from "./workspace-panel";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
  workspaceFiles: FileItem[];
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  disabled,
  workspaceFiles,
}: ChatInputProps) {
  const [showFileAutocomplete, setShowFileAutocomplete] = useState(false);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Handle key press events
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !showFileAutocomplete) {
      e.preventDefault();
      onSubmit();
    } else if (e.key === "@") {
      setShowFileAutocomplete(true);
      setFilteredFiles(workspaceFiles);
      // Store the current cursor position when @ is typed
      if (inputRef.current) {
        setCursorPosition(inputRef.current.selectionStart || 0);
      }
    } else if (showFileAutocomplete) {
      if (e.key === "Escape") {
        setShowFileAutocomplete(false);
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        navigateAutocomplete(e.key === "ArrowDown" ? 1 : -1);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertSelectedFile();
      }
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Always update cursor position on input change
    const curPos = e.target.selectionStart || 0;
    setCursorPosition(curPos);

    if (showFileAutocomplete) {
      // Get the text after the @ symbol
      const lastAtPos = newValue.substring(0, curPos).lastIndexOf("@");
      if (lastAtPos >= 0) {
        const searchTerm = newValue
          .substring(lastAtPos + 1, curPos)
          .toLowerCase();
        const filtered = workspaceFiles.filter((file) =>
          file.name.toLowerCase().includes(searchTerm)
        );
        setFilteredFiles(filtered);
      } else {
        setShowFileAutocomplete(false);
      }
    }
  };

  // Handle click on a file in autocomplete
  const handleFileClick = (file: FileItem) => {
    insertFile(file);
  };

  // Insert the selected file into the input
  const insertSelectedFile = () => {
    if (filteredFiles.length > 0) {
      insertFile(filteredFiles[0]);
    }
  };

  // Insert a file reference into the input
  const insertFile = (file: FileItem) => {
    const lastAtPos = value.substring(0, cursorPosition).lastIndexOf("@");
    if (lastAtPos >= 0) {
      const newValue =
        value.substring(0, lastAtPos) +
        `@${file.name} ` +
        value.substring(cursorPosition);

      onChange(newValue);

      // Set cursor position after the inserted file name and the space
      setTimeout(() => {
        if (inputRef.current) {
          const newCursorPos = lastAtPos + file.name.length + 2; // +1 for @ symbol, +1 for space
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }

    setShowFileAutocomplete(false);
  };

  // Navigate through autocomplete options
  const navigateAutocomplete = (direction: number) => {
    // This is a simplified version - in a real implementation,
    // you would track the selected index and update it
    // For now, we just select the first item
  };

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowFileAutocomplete(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get file icon based on type
  const getFileIcon = (file: FileItem) => {
    switch (file.type) {
      case "code":
        return <FileCode className="h-4 w-4 mr-2 text-blue-500" />;
      case "markdown":
        return <FileText className="h-4 w-4 mr-2 text-green-500" />;
      default:
        return <File className="h-4 w-4 mr-2 text-gray-500" />;
    }
  };

  // Get color for file type
  const getFileColor = (fileName: string) => {
    const file = workspaceFiles.find((f) => f.name === fileName);
    if (!file) return "text-gray-500";

    switch (file.type) {
      case "code":
        return "text-blue-500";
      case "markdown":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  // Handle input click to focus the actual input
  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Render the input content with file mentions as separate spans
  const renderInputContent = () => {
    if (!value) return null;

    const parts = [];
    let lastIndex = 0;
    const regex = /@([a-zA-Z0-9_\-\.]+)/g;
    let match;

    while ((match = regex.exec(value)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {value.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add the matched file as a separate span
      const fileName = match[1];
      parts.push(
        <span
          key={`file-${match.index}`}
          className="inline-flex items-center text-green-500"
        >
          @{fileName}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < value.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>{value.substring(lastIndex)}</span>
      );
    }

    return <div className="flex flex-wrap items-center">{parts}</div>;
  };

  return (
    <div className="relative">
      <div
        className="w-full min-h-[36px] bg-transparent border border-input rounded-md px-3 py-2 text-sm flex items-center cursor-text overflow-x-hidden"
        onClick={handleContainerClick}
      >
        {renderInputContent() || (
          <span className="text-muted-foreground/50">
            Ask a question, make a change, go wild...
          </span>
        )}
        <input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="absolute inset-0 w-full h-full opacity-0 cursor-text"
          disabled={disabled}
        />
      </div>

      {showFileAutocomplete && filteredFiles.length > 0 && (
        <div
          ref={autocompleteRef}
          className="absolute bottom-full mb-2 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto z-50"
        >
          {filteredFiles.map((file, index) => (
            <div
              key={file.id}
              className="flex items-center px-3 py-2 hover:bg-muted cursor-pointer"
              onClick={() => handleFileClick(file)}
            >
              {getFileIcon(file)}
              <span>{file.name}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-2">
        <Button
          size="sm"
          variant="ghost"
          className="rounded-none text-xs text-muted-foreground gap-2"
        >
          <Plus className="h-4 w-4" />
          Add context
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-xs rounded-none text-muted-foreground gap-2"
        >
          <HelpCircle className="h-4 w-4" />
          Help
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          className="rounded-none text-xs gap-2"
          onClick={onSubmit}
          disabled={isLoading || !value.trim() || disabled}
        >
          {isLoading ? "Sending..." : "Send"}
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
