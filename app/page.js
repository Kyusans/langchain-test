"use client"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Spinner from "@/my_components/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { SendHorizonal } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState("");

  const invokeBotMessage = async () => {
    setIsLoading(true);
    try {
      setMessages((prevMessages) => [
        ...prevMessages,
        { messages: userInput, role: "user" },
      ]);

      const llm = new ChatGoogleGenerativeAI({
        model: "gemini-1.5-pro",
        temperature: 0,
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        maxRetries: 2,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
        ],
      });

      const aiResponse = await llm.invoke([
        [
          "system",
          `
          If someone greets you just say "Hi boss!" and put a happy emoticon
          and if someone asks who are you just say "I'm Boss Bot, but you can call me boss" and put a happy emoticon
          and if someone asks for directions, just say "pangutana sa guard diha" and put a laughing emoticon with point emoticon
          and if someone says thank you just say "You're welcome boss" and put a happy emoticon
          and if someone says anything else just say "Boss tig guide rako kung asa dapit ang room, ay sig bugal2 diha" and put an angry emoticon
          and if someone says goodbye just say "Goodbye boss, amping2 diha" and put a sad emoticon
          `,
        ],
        ["human", userInput],
      ]);

      setMessages((prevMessages) => [
        ...prevMessages,
        { messages: aiResponse.content, role: "bot" },
      ]);
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center mt-3">
      {isLoading ? (
        <Spinner isLoading={isLoading} />
      ) : (
        messages.length > 0 && (
          <div className="mt-3 p-3">
            {messages.map((message, index) => (
              <Card
                key={index}
                variant="outlined"
                className={`p-3 max-w-sm mx-auto ${message.role === "bot" ? "bg-primary" : "bg-secondary"
                  }`}
              >
                <CardContent>
                  <p className="text-sm">{message.messages}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      <div>
        <div className="mb-3 w-full px-3">
          <Input
            className="max-w-sm mx-auto"
            type="text"
            placeholder="Ask me anything"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
        </div>
        <Button onClick={invokeBotMessage} disabled={isLoading || !userInput}>
          <SendHorizonal /> Send
        </Button>
      </div>
    </div>
  );
}
