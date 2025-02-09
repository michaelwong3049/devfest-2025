"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
//import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
//import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { handleGroq } from "@/lib/utils";
import * as monaco from "monaco-editor";
import AgentInterface from "@/components/AgentInterface";
import TestResults from "@/components/TestResults";
import { Editor } from "@monaco-editor/react";

import io, { Socket } from "socket.io-client";

interface TestCase {
  input: string | number | Array<string | number>;
  expected_output: string | number | Array<string | number>;
}

interface InterviewInfoProps {
  question: string;
  examples: Array<string>;
  difficulty: string;
  constraints: string;
  test_cases: Array<TestCase>;
}

export default function InterviewPage() {
  const [code, setCode] = useState("// Write your code here");
  const [language, setLanguage] = useState<string>("python");
  const [output, setOutput] = useState([]);
  const [interviewInfo, setInterviewInfo] =
    useState<InterviewInfoProps | null>();
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");
  const difficulty = searchParams.get("difficulty");

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Create the socket connection
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Debounce function to limit update frequency.
  const debounce = (func: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const emitCodeUpdate = debounce((newCode: string) => {
    console.log("Sending code update:", newCode);
    socketRef.current?.emit("update_code", { code: newCode });
  }, 500);

  const emitQuestionUpdate = debounce((newQuestion: string) => {
    console.log("Sending question update:", newQuestion);
    socketRef.current?.emit("update_question", { question: newQuestion });
  }, 500);

  const [question, setQuestion] = useState({
    title: "",
    description: "",
    constraints: "",
    examples: "",
  });

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    if (!editorRef.current) {
      editorRef.current = editor;
    }
  };

  const handleEditorChange = (value?: string) => {
    if (value) {
      setCode(value);
      emitCodeUpdate(value);
    }
  };

  const showValue = () => {
    if (editorRef.current) {
      alert(editorRef.current.getValue());
    }
  };

  const handleInterpreter = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/interpret", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "hi",
          user_code: code,
          test_cases: interviewInfo?.test_cases,
        }),
      });
      const data = await response.json();
      console.log(data);
      setOutput(data);
      setShowOutput(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    // javascript workers allow you to run javascript in another enviornment for improved safety over something like eval()
    // the idea of this is to capture the entire function that was written and then run it based on the "section" that calls the function
    // the return is conslole logs and return statments (return statements match to the test case)

    const fetchGPTResult = async () => {
      const result = await handleGroq();
      console.log(result.question);
      console.log(result.examples);
      console.log(result.difficulty);
      console.log(result.constraints);
      for (let i = 0; i < result.test_cases.length; i++) {
        console.log(result.test_cases[i].input);
        console.log(result.test_cases[i].expected_output);
      }
      console.log(result);
      setInterviewInfo(result);
      setQuestion({
        title: `${topic} Question (${difficulty})`,
        description: result?.question || "",
        constraints: result?.constraints || "",
        examples: Array.isArray(result?.example)
          ? result.example.join("\n")
          : result?.example || "",
      });
      emitQuestionUpdate(result.question); // Socket connection to send the question to the backend
    };
    fetchGPTResult();
  }, [topic, difficulty]);

  return (
    <div className="flex h-screen">
      <div className="w-1/3 p-4 flex flex-col">
        <Tabs defaultValue="question" className="flex-grow">
          <TabsList>
            <TabsTrigger value="question">Question</TabsTrigger>
            <TabsTrigger value="testcases">Test Cases</TabsTrigger>
          </TabsList>
          <TabsContent value="question" className="h-full">
            <h2 className="text-2xl font-bold mb-4">{question.title}</h2>
            <p className="mb-4">{question.description}</p>
            <h3 className="text-xl font-semibold mb-2">Constraints:</h3>
            <pre className="bg-gray-100 p-2 rounded overflow-auto">
              {question.constraints}
            </pre>
            <h3 className="text-xl font-semibold mt-4 mb-2">Examples:</h3>
            <pre className="bg-gray-100 p-2 rounded overflow-auto">
              {interviewInfo?.examples.map(
                (example: string, index: number) =>
                  `Example ${index + 1}: ${example} \n`
              ) || "No examples available."}
            </pre>
          </TabsContent>
          <TabsContent value="testcases" className="h-full overflow-auto">
            <h3 className="text-xl font-semibold mb-2">Test Cases:</h3>
            <pre className="bg-gray-100 p-2 rounded overflow-auto">
              {interviewInfo?.test_cases.map(
                (test_case, index) =>
                  `Test Case ${index}:
		    Input: ${
          typeof test_case.input === "object"
            ? Object.values(test_case.input)[0]
            : test_case.input
        }
		    Expected Output: ${test_case.expected_output}
		`
              )}
            </pre>
          </TabsContent>
        </Tabs>
        <AgentInterface />
      </div>
      <div className="w-2/3 p-4 flex flex-col">
        {/* <div className="mb-4 flex items-center">
          <Avatar className="h-12 w-12 mr-4">
            <AvatarImage src="/placeholder.svg" alt="AI Interviewer" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <span className="text-lg font-semibold">AI Interviewer</span>
        </div> */}
        <div className="flex-grow">
          <div className="flex py-2 gap-2">
            {/* <Button onClick={showValue}>show value</Button> */}
            <Button onClick={() => handleInterpreter()}>Run Tests</Button>
          </div>
          <Editor
            height="60vh"
            defaultLanguage={language}
            defaultValue="# Write your code below!"
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
            theme="vs-dark"
          />
          {/* {showOutput && ( */}
          {output && <TestResults output={output} />}
          {/* )} */}
        </div>
      </div>
    </div>
  );
}
