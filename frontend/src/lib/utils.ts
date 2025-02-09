import Groq from "groq-sdk";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function handleGroq() {
  const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
  })

  const completion = await groq.chat.completions.create({
    messages: [
      {
	role: "system",
	content: `You are supposed to create a software engineering technical interview problem for leetcode style/data structures and algorithms in JSON format (PLEASE AVOID TREE PROBLEMS). The JSON format should look like: 
	    question: string (the acutal question),
	    difficulty: string (how hard the question is going to be; similar to leetcode)
	    examples: array of strings (examples of what a solution to an example would look like)
	    constraints: string (what are some boundaries that the interviewer shoudl know?)
	    test_cases: array of this object type: [{ input, expected_output }] (the input is the actual test case where they are going to run against to see if they solved it, the expected_output is what the correct answer should be for the input)`
      },
      {
	role: "user",
	content: `give me a problem to solve `,
      },
    ],
    response_format: { type: "json_object" },
    model: "llama-3.3-70b-versatile",
  });

  // CAREFUL OF THE !; COULD BE NULL?
  const result =  await JSON.parse(completion.choices[0].message.content!);
  return result;
}

