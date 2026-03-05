import { Link } from "react-router";
import {
  PageHeader,
  PageSection,
  FeatureCard,
  GridSection,
  Badge,
  InfoBox,
} from "~/components/void-components";

const problems = [
  {
    name: "Two Sum",
    path: "/problems/two-sum",
    description: "Find two numbers that add up to a target",
    difficulty: "Easy",
    icon: "[2SUM]",
  },
  {
    name: "Swap Elements",
    path: "/problems/swap",
    description: "Different approaches to swapping array elements",
    difficulty: "Easy",
    icon: "[SWAP]",
  },
  {
    name: "Sum Array",
    path: "/problems/sum-array",
    description: "Sum array elements with formula optimization",
    difficulty: "Easy",
    icon: "[ARRY]",
  },
];

export default function ProblemSolver() {
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">
        <PageHeader
          title="Problem Solver"
          description="Interactive coding problems with solutions and test cases"
        />

        <PageSection>
          <GridSection cols={3}>
            {problems.map((problem) => (
              <Link key={problem.path} to={problem.path}>
                <div className="relative">
                  <FeatureCard
                    title={problem.name}
                    description={problem.description}
                    icon={problem.icon}
                  />
                  <div className="absolute top-0 right-0 pt-6 pr-6">
                    <Badge variant={problem.difficulty === "Easy" ? "success" : "warning"}>
                      {problem.difficulty}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </GridSection>
        </PageSection>

        <PageSection title="Practice Problems">
          <InfoBox>
            These problems help you understand fundamental programming concepts like data
            structures, algorithms, and code optimization. Each problem includes test cases and
            multiple solutions.
          </InfoBox>
        </PageSection>
      </div>
    </div>
  );
}
