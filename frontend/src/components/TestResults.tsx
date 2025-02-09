"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";

interface TestResult {
  input: any;
  expected: any;
  output: any;
  passed: boolean;
  "std output": string;
}

interface TestResultsProps {
  output: TestResult[];
}

export default function TestResults({ output }: TestResultsProps) {
  const [openStates, setOpenStates] = useState<boolean[]>(
    output.map(() => false)
  );

  const toggleOpen = (index: number) => {
    setOpenStates((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const passedTests = output.filter((result) => result.passed).length;
  const totalTests = output.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>
            {passedTests} of {totalTests} tests passed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {output.map((result, index) => (
              <Collapsible
                key={index}
                open={openStates[index]}
                onOpenChange={() => toggleOpen(index)}
              >
                <Card
                  className={
                    result.passed ? "border-green-500" : "border-red-500"
                  }
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Test Case {index + 1}
                      </CardTitle>
                      <CollapsibleTrigger>
                        {openStates[index] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                    </div>
                    <CardDescription className="flex items-center mt-1">
                      {result.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      {result.passed ? "Passed" : "Failed"}
                    </CardDescription>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="pt-2">
                      <div className="space-y-2 text-sm">
                        <div>
                          <Badge variant="outline">Input</Badge>
                          <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                            {JSON.stringify(result.input, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <Badge variant="outline">Expected Output</Badge>
                          <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                            {JSON.stringify(result.expected, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <Badge variant="outline">Actual Output</Badge>
                          <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                            {JSON.stringify(result.output, null, 2)}
                          </pre>
                        </div>
                        {result["std output"] && (
                          <div>
                            <Badge variant="outline">Console Output</Badge>
                            <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                              {result["std output"]}
                            </pre>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
