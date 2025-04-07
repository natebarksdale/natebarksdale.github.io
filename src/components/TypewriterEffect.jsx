import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const TypewriterEffect = ({ sequences = [], loop = false, className = "" }) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [currentSequence, setCurrentSequence] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const typingTimeout = useRef(null);
  const sequenceComplete = useRef(false);

  // Default sequence if none provided
  const defaultSequences = [{ text: "What Comes Next", delayAfter: 1000 }];

  const finalSequences = sequences.length > 0 ? sequences : defaultSequences;

  useEffect(() => {
    const sequence = finalSequences[currentSequence];
    const targetText = sequence.text;
    const deleteAfter = sequence.deleteChars || 0;

    // Clear any existing timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    if (isTyping) {
      // Typing forward
      if (displayText.length < targetText.length) {
        const randomDelay = Math.floor(Math.random() * 180) + 60; // Random delay between 60-240ms
        typingTimeout.current = setTimeout(() => {
          setDisplayText(targetText.substring(0, displayText.length + 1));
        }, randomDelay);
      } else {
        // Finished typing current sequence
        sequenceComplete.current = true;
        typingTimeout.current = setTimeout(() => {
          if (deleteAfter > 0) {
            setIsTyping(false);
          } else if (currentSequence < finalSequences.length - 1) {
            setCurrentSequence(currentSequence + 1);
            setDisplayText("");
          } else if (loop) {
            setCurrentSequence(0);
            setDisplayText("");
          } else {
            // Start blinking cursor animation when typing is done
            setCursorVisible(true);
          }
        }, sequence.delayAfter || 1000);
      }
    } else {
      // Deleting
      if (displayText.length > targetText.length - deleteAfter) {
        const randomDelay = Math.floor(Math.random() * 180) + 60;
        typingTimeout.current = setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        }, randomDelay);
      } else {
        // Move to next sequence or restart if at the end
        typingTimeout.current = setTimeout(() => {
          setIsTyping(true);
          if (currentSequence < finalSequences.length - 1) {
            setCurrentSequence(currentSequence + 1);
          } else if (loop) {
            setCurrentSequence(0);
          }
        }, 200);
      }
    }

    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [displayText, isTyping, currentSequence, finalSequences, loop]);

  // Cursor animation - only starts blinking after typing is complete
  const cursorAnimation = {
    opacity: sequenceComplete.current ? [1, 0, 1] : 1, // Only blink after typing is complete
    transition: {
      repeat: sequenceComplete.current ? Infinity : 0,
      duration: 3,
      ease: "linear",
    },
  };

  return (
    <div className={`flex items-center ${className}`}>
      <span className="what-comes-next">{displayText}</span>
      <motion.span
        className="what-comes-next"
        animate={cursorAnimation}
        style={{ marginLeft: "0em" }}
      >
        _
      </motion.span>
    </div>
  );
};

export default TypewriterEffect;
