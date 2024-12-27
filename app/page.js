"use client";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Spinner from "@/my_components/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { SendHorizonal } from "lucide-react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const invokeBotMessage = async () => {
    // You are a friendly and helpful assistant named Boss Bot.
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
          Always end the sentence with necessary emoticon
          If someone greets you just say "Hi boss! Unsa may pangutana nimo boss?"
          and if someone asks who are you just say "Wala pako gi pangalan ni kyusans, pero tawagi rakog boss para chuy" 
          and if someone asks for directions, just say "pangutana sa guard diha" and put a laughing emoticon with point emoticon
          and if someone says thank you just say "You're welcome boss" 
          and if someone says anything else just say "Boss tig guide rako kung asa dapit ang room, ay sig bugal2 diha" 
          and if someone says goodbye just say "Goodbye boss, amping2 diha" 
          `,
        ],
        ["human", userInput],
      ]);

      setMessages((prevMessages) => [
        ...prevMessages,
        { messages: aiResponse.content, role: "bot" },
      ]);
      setUserInput("");
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-6">
      <div className="w-full p-4 rounded-lg max-h-[80vh] overflow-y-auto">
        <div className="flex flex-col gap-3">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "bot" ? "justify-start" : "justify-end"}`}
            >
              <Card
                className={`p-3 max-w-sm ${message.role === "user" && "bg-secondary"}`}
              >
                <CardContent>
                  <p className="text-sm">{message.messages}</p>
                </CardContent>
              </Card>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      <form
        className="mt-4 flex items-center gap-2 w-full max-w-lg"
        onSubmit={(e) => {
          e.preventDefault();
          invokeBotMessage();
        }}
      >
        <Input
          className="flex-grow"
          type="text"
          placeholder="Ask me any location..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <Button type="submit" disabled={isLoading || !userInput.trim()}>
          {isLoading ? <Spinner isLoading={isLoading} /> : <SendHorizonal />}
        </Button>
      </form>
    </div>
  );
}
