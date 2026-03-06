import { useEffect, useState } from 'react';

function useTyping(strings, speed = 75, pause = 1800) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!Array.isArray(strings) || strings.length === 0) {
      return undefined;
    }

    if (isPaused) {
      const waitTimer = setTimeout(() => setIsPaused(false), pause);
      return () => clearTimeout(waitTimer);
    }

    const currentWord = strings[wordIndex];

    if (!isDeleting && charIndex < currentWord.length) {
      const typeTimer = setTimeout(() => {
        setText(currentWord.slice(0, charIndex + 1));
        setCharIndex((value) => value + 1);
      }, speed);

      return () => clearTimeout(typeTimer);
    }

    if (!isDeleting && charIndex === currentWord.length) {
      setIsPaused(true);
      setIsDeleting(true);
      return undefined;
    }

    if (isDeleting && charIndex > 0) {
      const deleteTimer = setTimeout(() => {
        setText(currentWord.slice(0, charIndex - 1));
        setCharIndex((value) => value - 1);
      }, Math.max(30, Math.floor(speed / 2)));

      return () => clearTimeout(deleteTimer);
    }

    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setWordIndex((value) => (value + 1) % strings.length);
    }

    return undefined;
  }, [strings, speed, pause, isPaused, wordIndex, charIndex, isDeleting]);

  return text;
}

export default useTyping;
