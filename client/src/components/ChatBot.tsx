import { useState, useEffect } from "react";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { sendMessage } from "@/api/chat";
import { useToast } from "@/hooks/useToast";

// Helper function to format message text
const formatMessageText = (text) => {
  if (!text) return "";

  // Replace bold text (**text**) with styled spans
  const withBoldText = text.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>');

  // Preserve line breaks by converting them to <br> tags
  return withBoldText.replace(/\n/g, '<br>');
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load messages from local storage when component mounts
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Failed to parse saved messages:", error);
      }
    }
  }, []);

  // Save messages to local storage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Message cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const newMessage = { text: message, isUser: true };
    setMessages([...messages, newMessage]);
    setMessage("");
    setIsLoading(true); // Set loading state to true before API call

    try {
      console.log("Sending message to API:", message);
      const response = await sendMessage(message);
      console.log("Received response from API:", response);
      setMessages(prev => [...prev, { text: response.response, isUser: false }]);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response from AI assistant",
        variant: "destructive",
      });
      // Add a system message indicating the error
      setMessages(prev => [...prev, {
        text: "Sorry, I couldn't process your request at the moment.",
        isUser: false
      }]);
    } finally {
      setIsLoading(false); // Set loading state to false after API call completes
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };

  return (
    <div className="fixed bottom-16 right-4 z-50">
      {isOpen ? (
        <Card className="w-80 h-96 flex flex-col bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold">AI Assistant</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    msg.isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-base"
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }}
                ></div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center items-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-12 w-12"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}