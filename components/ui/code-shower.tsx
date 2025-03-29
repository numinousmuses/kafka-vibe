"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import SyntaxHighlighter from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeShowerProps {
  filename?: string;
  code: string;
  language?: string;
  results?: string;
  uid?: string;
}

export function CodeShower({
  filename,
  code,
  language = "python",
  results,
  uid,
}: CodeShowerProps) {
  const [showResults, setShowResults] = useState(false);

  // useEffect(() => {
  //   if (results) {
  //     setShowResults(true);
  //   }
  // }, [results]);

  return (
    <Card className="overflow-hidden border border-border shadow-sm">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
          <div className="text-xs font-medium text-foreground">{filename}</div>
          {uid && (
            <div className="text-xs text-muted-foreground">
              ID: {uid.substring(0, 8)}
            </div>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={tomorrow}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "0.75rem",
            background: "var(--background)",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {results && (
        <div className="border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowResults(!showResults)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Results
            {showResults ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showResults && (
            <div className="p-4 text-xs bg-muted/30 rounded-b-md overflow-x-auto">
              <pre className="whitespace-pre-wrap">{results}</pre>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
