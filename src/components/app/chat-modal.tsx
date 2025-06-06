'use client';

import { useState, type FormEvent, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendHorizonal, UserCircle } from 'lucide-react';
import type { Asset } from '@/types';

interface ChatModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  asset: Asset | null;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: Date;
}

export function ChatModal({ isOpen, onOpenChange, asset }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (isOpen && asset) {
      // Simulate loading initial messages or a welcome message
      setMessages([
        { id: '1', text: `Hello! I'm interested in your listing for ${asset.name}.`, sender: 'other', timestamp: new Date() },
      ]);
    } else {
      setMessages([]); // Clear messages when modal is closed or no asset
    }
  }, [isOpen, asset]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    const message: Message = {
      id: String(Date.now()),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages([...messages, message]);
    setNewMessage('');
    // Simulate a reply
    setTimeout(() => {
        setMessages(prev => [...prev, {id: String(Date.now() + 1), text: "Okay, let's discuss.", sender: 'other', timestamp: new Date()}]);
    }, 1000);
  };

  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] flex flex-col h-[80vh] max-h-[700px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Chat about {asset.name}</DialogTitle>
          <DialogDescription>
            Discuss details with the seller before proceeding with the trade.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow p-4 border rounded-md my-4 bg-muted/30">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end space-x-2 ${
                  msg.sender === 'user' ? 'justify-end' : ''
                }`}
              >
                {msg.sender === 'other' && <UserCircle className="h-8 w-8 text-muted-foreground" />}
                <div
                  className={`p-3 rounded-lg max-w-[70%] ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs text-muted-foreground/80 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                 {msg.sender === 'user' && <UserCircle className="h-8 w-8 text-primary" />}
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" size="icon" aria-label="Send message">
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
