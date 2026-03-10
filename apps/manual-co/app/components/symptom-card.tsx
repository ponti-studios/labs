"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@pontistudios/ui";
import { cn } from "@pontistudios/ui";
import type { MatchedSymptom } from "../types/symptom";
import React from "react";
import { SymptomCardGuidance } from "./symptom-card-guidance";

type SymptomCardProps = {
  className?: string;
  symptom: MatchedSymptom;
  isAlternative?: boolean;
};

function SymptomCard({ className, symptom, isAlternative = false }: SymptomCardProps) {
  return (
    <>
      <Card
        className={cn(
          "min-w-sm flex flex-col",
          {
            "md:max-w-sm": isAlternative,
            "md:max-w-md": !isAlternative,
          },
          className,
        )}
      >
        <CardHeader className="flex-1">
          <CardTitle
            data-testid="symptom-name"
            className="capitalize flex items-center justify-between"
          >
            <p>{symptom.name}</p>
          </CardTitle>
          <CardDescription>{symptom.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Severity:</span>
            <span
              data-testid="symptom-severity"
              className={cn("px-3 py-1 text-sm rounded-full text-white", {
                "bg-destructive": symptom.severity_score >= 7,
                "bg-amber-500": symptom.severity_score >= 4 && symptom.severity_score < 7,
                "bg-green-500": symptom.severity_score < 4,
              })}
            >
              {symptom.severity_score}
            </span>
          </div>

          {/* Only show recommended action for non-alternative symptoms */}
          {!isAlternative && (
            <SymptomCardGuidance guidance={symptom.treatment_guidance} symptom={symptom} />
          )}

          {/* Only show articles for non-alternative symptoms */}
          {!isAlternative && symptom.articles && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Further Reading:</h4>
              <ul className="list-inside text-sm space-y-3">
                {symptom.articles.map((article) => (
                  <li key={crypto.getRandomValues(new Uint32Array(1))[0]}>
                    <a
                      href={article.url}
                      className="text-blue-600 underline underline-offset-3"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {article.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default SymptomCard;
