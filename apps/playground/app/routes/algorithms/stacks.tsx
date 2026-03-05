import { useState } from "react";
import { isPalindrome, Stack } from "~/lib/algorithms/stacks";
import {
  PageHeader,
  PageSection,
  FormSection,
  InputField,
  ResultBox,
  InfoBox,
  CodeBlock,
} from "~/components/void-components";

export default function StacksDemo() {
  const [wordInput, setWordInput] = useState("racecar");
  const [result, setResult] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = () => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        const isPalin = isPalindrome(wordInput);
        setResult({ word: wordInput, isPalindrome: isPalin });
      } catch (error) {
        setResult({ error: "INVALID INPUT" });
      }
      setIsLoading(false);
    }, 100);
  };

  const handleReset = () => {
    setResult(undefined);
    setWordInput("racecar");
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">
        <PageHeader
          title="Stacks & Palindromes"
          description="Learn how to use stacks to check if a word is a palindrome"
        />

        <PageSection title="What Is a Stack?">
          <p className="text-sm text-white/80 mb-4 font-mono">
            A Stack is a Last-In-First-Out (LIFO) data structure where items are added and removed
            from the same end (top). Like a stack of books - you add to the top and remove from the
            top.
          </p>
          <h4 className="text-lg font-bold uppercase tracking-widest text-white mt-6 mb-3">
            Palindrome Checking
          </h4>
          <p className="text-sm text-white/80 font-mono">
            A palindrome is a word that reads the same forwards and backwards. We can check this
            using a stack by pushing characters onto the stack and then comparing them as we pop.
          </p>
        </PageSection>

        <PageSection title="Complexity Analysis">
          <InfoBox>
            <div className="space-y-1 font-mono text-sm">
              <p>
                <strong>TIME COMPLEXITY:</strong> O(N)
              </p>
              <p>
                <strong>SPACE COMPLEXITY:</strong> O(N)
              </p>
            </div>
          </InfoBox>
        </PageSection>

        <PageSection title="Palindrome Checker">
          <FormSection onSubmit={handleCheck} isLoading={isLoading}>
            <InputField
              label="Enter a Word"
              value={wordInput}
              onChange={(v) => setWordInput(v.toLowerCase())}
              placeholder="racecar"
            />
          </FormSection>

          {result && !result.error && (
            <ResultBox label="RESULT" state={result.isPalindrome ? "success" : "error"}>
              <div className="font-mono text-sm text-white/80">
                {result.isPalindrome
                  ? `[✓] "${result.word}" IS A PALINDROME`
                  : `[✗] "${result.word}" IS NOT A PALINDROME`}
              </div>
            </ResultBox>
          )}

          {result && (
            <button
              onClick={handleReset}
              className="text-xs font-mono uppercase tracking-widest border border-white/20 text-white/80 px-4 py-2 hover:bg-white/5 hover:border-white/40 transition-all duration-100 cursor-crosshair"
            >
              Reset
            </button>
          )}
        </PageSection>

        <PageSection title="Stack Operations">
          <div className="space-y-2 font-mono text-sm text-white/80">
            <div>
              <strong>PUSH:</strong> Add an element to the top of the stack
            </div>
            <div>
              <strong>POP:</strong> Remove and return the top element
            </div>
            <div>
              <strong>PEEK:</strong> View the top element without removing it
            </div>
            <div>
              <strong>LENGTH:</strong> Get the number of elements in the stack
            </div>
          </div>
        </PageSection>
      </div>
    </div>
  );
}
