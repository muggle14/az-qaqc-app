# run.py

from agents.devops_agent import DevOpsAgent
from agents.reviewer_agent import ReviewerAgent
from agents.coordinator_agent import CoordinatorAgent

def main():
    devops = DevOpsAgent()
    reviewer = ReviewerAgent()
    coordinator = CoordinatorAgent(devops_agent=devops, reviewer_agent=reviewer)

    coordinator.run_and_fix_loop(max_iterations=8)

if __name__ == "__main__":
    main()
