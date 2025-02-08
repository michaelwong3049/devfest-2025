"use client"

import { React, useState } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const router = useRouter()

  const handleStart = () => {
    if (topic && difficulty) {
      router.push(`/interview?topic=${topic}&difficulty=${difficulty}`)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-4xl font-bold text-center">AI Mock Interview</h1>
        <Select onValueChange={setTopic}>
          <SelectTrigger>
            <SelectValue placeholder="Select a topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hashing">Hashing</SelectItem>
            <SelectItem value="linked-lists">Linked Lists</SelectItem>
            <SelectItem value="trees">Trees</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setDifficulty}>
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleStart} className="w-full" disabled={!topic || !difficulty}>
          Start Interview
        </Button>
      </div>
    </main>
  )
}

