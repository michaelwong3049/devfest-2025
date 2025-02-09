"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
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
//import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
//import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Editor, EditorProps } from "@monaco-editor/react"
import { handleGroq } from "@/lib/utils";
import * as monaco from "monaco-editor";
import AgentInterface from "@/components/AgentInterface";
import { setLogExtension } from "livekit-client";
import test from "node:test";

interface TestCase {
  input: string | number | Array<string | number>;
  expected_output: string | number | Array<string | number>;
}

interface InterviewInfoProps {
  question: string;
  example: Array<string>;
  difficulty: string;
  constraints: string;
  test_cases: Array<TestCase>;
}

export default function InterviewPage() {
  const [code, setCode] = useState("// Write your code here");
  const [answer, setAnswer] = useState();
  const [language, setLanguage] = useState<string>("javascript");
  const [runProgram, setRunProgram] = useState<boolean>(false);
  const [interviewInfo, setInterviewInfo] = useState<InterviewInfoProps | undefined>(undefined);
  const [runGPT, setRunGPT] = useState<boolean>(false);

  const searchParams = useSearchParams()
  const topic = searchParams.get("topic")
  const difficulty = searchParams.get("difficulty")
  const workerRef = useRef<Worker>();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

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
    }
  };

  const showValue = () => {
    if (editorRef.current) {
      alert(editorRef.current.getValue());
    }
  };

useEffect(() => {
    // javascript workers allow you to run javascript in another enviornment for improved safety over something like eval()
    // the idea of this is to capture the entire function that was written and then run it based on the "section" that calls the function
    // the return is conslole logs and return statments (return statements match to the test case)
    if (runProgram) {

      workerRef.current = new Worker(new URL("./worker.ts", import.meta.url));
      workerRef.current.postMessage({ code, language });
      workerRef.current.onmessage = (e) => {
        setAnswer(e.data);
      };
      console.log(answer);
      return () => workerRef.current?.terminate();
    }

    setRunProgram(false);

    if(runGPT) {
      const fetchGPTResult = async () => {
        const result = await handleGroq();
	console.log(result);

        const setInfo = (result: any) => {
          setInterviewInfo(prevInfo => ({
            ...prevInfo, 
            question: result.question,
            example: result.examples,
            difficulty: result.difficulty,
            constraints: result.constraints,
            test_cases: result.test_cases,
          }));
        }

        setInfo(result);
      };

      fetchGPTResult();  // <- Missing semicolon here
      // In a real app, you would fetch the question from an API based on the topic and difficulty
      setQuestion({
        title: `Sample ${topic} Question (${difficulty})`,
        description:
          "This is a sample question description. In a real app, this would be fetched from an API.",
        constraints: "- 1 <= n <= 10^5\n- -10^9 <= nums[i] <= 10^9",
        examples:
          "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
      })

      setRunProgram(false);
      setRunGPT(false);
    }
  }, [topic, difficulty, runProgram, runGPT]);

  return (
    <div className="flex h-screen">
      <div className="w-1/3 p-4 flex flex-col">
        <Tabs defaultValue="question" className="flex-grow">
          <TabsList>
            <TabsTrigger value="question">Question</TabsTrigger>
            <TabsTrigger value="testcases">Test Cases</TabsTrigger>
          </TabsList>
          <TabsContent value="question" className="h-full overflow-auto">
            <h2 className="text-2xl font-bold mb-4">{question.title}</h2>
            <p className="mb-4">{question.description}</p>
            <h3 className="text-xl font-semibold mb-2">Constraints:</h3>
            <pre className="bg-gray-100 p-2 rounded">
              {question.constraints}
            </pre>
            <h3 className="text-xl font-semibold mt-4 mb-2">Examples:</h3>
            <pre className="bg-gray-100 p-2 rounded">{question.examples}</pre>
          </TabsContent>
          <TabsContent value="testcases" className="h-full overflow-auto">
            <h3 className="text-xl font-semibold mb-2">Test Cases:</h3>
            <pre className="bg-gray-100 p-2 rounded">
              {interviewInfo?.test_cases.map((test_case, index) => (
		`Test Case ${index}:
		    Input: ${typeof test_case.input === "object" ? Object.values(test_case.input)[0] : test_case.input }
		    Expected Output: ${test_case.expected_output}
		`
	      ))}
            </pre>
          </TabsContent>
        </Tabs>
        <AgentInterface />
      </div>
      <div className="w-2/3 p-4 flex flex-col">
        <div className="mb-4 flex items-center">
          <Avatar className="h-12 w-12 mr-4">
            <AvatarImage src="/placeholder.svg" alt="AI Interviewer" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <span className="text-lg font-semibold">AI Interviewer</span>
        </div>
        <div className="flex-grow">
          <div className="flex flex-col">
            <button onClick={showValue}>show value</button>
            <button onClick={() => setRunProgram(true)}>Run</button>
            <button onClick={() => setRunGPT(true)}>GPT</button>
          </div>
          <Editor
            height="90vh"
            defaultLanguage="javascript"
            defaultValue="// some code here"
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
            theme="vs-dark"
          />
        </div>
      </div>
    </div>
  );
}
