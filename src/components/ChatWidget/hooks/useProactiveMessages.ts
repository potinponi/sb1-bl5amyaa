import { useState, useRef, useEffect } from 'react';
import type { Flow } from '../../../types';

export function useProactiveMessages(flow: Flow | null, isOpen: boolean) {
  const [proactiveMessageIndex, setProactiveMessageIndex] = useState(0);
  const [proactiveMessageCount, setProactiveMessageCount] = useState(0);
  const proactiveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showProactiveBubble, setShowProactiveBubble] = useState(false);
  const [currentProactiveMessage, setCurrentProactiveMessage] = useState('');

  // Debug logging
  useEffect(() => {
    console.log('Flow proactive messages config:', {
      enabled: flow?.data?.proactiveMessages?.enabled,
      messages: flow?.data?.proactiveMessages?.messages,
      delay: flow?.data?.proactiveMessages?.delay,
      interval: flow?.data?.proactiveMessages?.interval,
      maxMessages: flow?.data?.proactiveMessages?.maxMessages
    });
  }, [flow?.data?.proactiveMessages]);

  // Reset states when flow or enabled state changes
  useEffect(() => {
    const isEnabled = flow?.data?.proactiveMessages?.enabled;
    if (!isEnabled) {
      setShowProactiveBubble(false);
      setProactiveMessageIndex(0);
      setProactiveMessageCount(0);
      if (proactiveTimerRef.current) {
        clearTimeout(proactiveTimerRef.current);
      }
    }
  }, [flow?.data?.proactiveMessages?.enabled]);

  useEffect(() => {
    // Reset timer when component mounts or when isOpen changes
    if (proactiveTimerRef.current) {
      clearTimeout(proactiveTimerRef.current);
    }

    // Don't show messages when chat is open
    if (isOpen) {
      setShowProactiveBubble(false);
      return;
    }

    // Don't proceed if proactive messages are disabled
    if (!flow?.data?.proactiveMessages?.enabled) {
      setShowProactiveBubble(false);
      return;
    }

    const { delay, interval, messages, maxMessages } = flow.data.proactiveMessages;

    // Validate required fields
    if (!messages?.length || !delay || !interval || !maxMessages) {
      console.warn('Invalid proactive messages configuration:', { messages, delay, interval, maxMessages });
      setShowProactiveBubble(false);
    }

    const showNextMessage = () => {
      // Don't show more messages if we've reached the limit or chat is open
      if (proactiveMessageCount >= maxMessages || isOpen) {
        setShowProactiveBubble(false);
        return;
      }

      console.log('Showing proactive message:', { message: messages[proactiveMessageIndex % messages.length], count: proactiveMessageCount + 1 });
      const message = messages[proactiveMessageIndex % messages.length];
      setCurrentProactiveMessage(message);
      setShowProactiveBubble(true);
      setProactiveMessageIndex(prev => prev + 1);
      setProactiveMessageCount(prev => prev + 1);

      // Schedule next message if we haven't reached the limit
      if (proactiveMessageCount + 1 < maxMessages) {
        proactiveTimerRef.current = setTimeout(showNextMessage, interval * 1000);
      }
    };

    // Start timer with initial delay or interval
    const initialDelay = proactiveMessageCount === 0 ? delay * 1000 : interval * 1000;
    proactiveTimerRef.current = setTimeout(showNextMessage, initialDelay);

    return () => {
      if (proactiveTimerRef.current) {
        clearTimeout(proactiveTimerRef.current);
      }
    };
  }
  )

  return {
    showProactiveBubble,
    setShowProactiveBubble,
    currentProactiveMessage
  };
}