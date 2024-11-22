import { describe, it, expect, beforeEach } from 'vitest';

// Mock Clarity contract state
let stories = new Map();
let chapters = new Map();
let plotDecisions = new Map();
let storyContributors = new Map();
let storyOwners = new Map();
let lastStoryId = 0;
let lastDecisionId = 0;

// Mock Clarity functions
function createStory(sender: string, title: string): number {
  const newStoryId = ++lastStoryId;
  stories.set(newStoryId, { title, currentChapter: 0, isComplete: false });
  storyOwners.set(newStoryId, sender);
  return newStoryId;
}

function addChapter(sender: string, storyId: number, content: string): number {
  const story = stories.get(storyId);
  if (!story || story.isComplete) {
    throw new Error('Story not found or completed');
  }
  const newChapterId = story.currentChapter + 1;
  chapters.set(`${storyId}-${newChapterId}`, { content, author: sender });
  story.currentChapter = newChapterId;
  storyContributors.set(`${storyId}-${sender}`, true);
  return newChapterId;
}

function createPlotDecision(storyId: number, optionA: string, optionB: string): number {
  const story = stories.get(storyId);
  if (!story || story.isComplete) {
    throw new Error('Story not found or completed');
  }
  const newDecisionId = ++lastDecisionId;
  plotDecisions.set(`${storyId}-${newDecisionId}`, { options: [optionA, optionB], votes: [0, 0], isOpen: true });
  return newDecisionId;
}

function voteOnPlot(storyId: number, decisionId: number, option: number): void {
  const decision = plotDecisions.get(`${storyId}-${decisionId}`);
  if (!decision || !decision.isOpen) {
    throw new Error('Decision not found or closed');
  }
  if (option !== 0 && option !== 1) {
    throw new Error('Invalid option');
  }
  decision.votes[option]++;
}

function closeVoting(sender: string, storyId: number, decisionId: number): void {
  if (sender !== 'contract-owner') {
    throw new Error('Not authorized');
  }
  const decision = plotDecisions.get(`${storyId}-${decisionId}`);
  if (!decision) {
    throw new Error('Decision not found');
  }
  decision.isOpen = false;
}

function completeStory(sender: string, storyId: number): void {
  if (sender !== 'contract-owner') {
    throw new Error('Not authorized');
  }
  const story = stories.get(storyId);
  if (!story) {
    throw new Error('Story not found');
  }
  story.isComplete = true;
}

describe('Collaborative Story Writing Contract', () => {
  beforeEach(() => {
    stories.clear();
    chapters.clear();
    plotDecisions.clear();
    storyContributors.clear();
    storyOwners.clear();
    lastStoryId = 0;
    lastDecisionId = 0;
  });
  
  it('should create a new story', () => {
    const storyId = createStory('user1', 'The Great Adventure');
    expect(storyId).toBe(1);
    expect(stories.get(1)).toEqual({ title: 'The Great Adventure', currentChapter: 0, isComplete: false });
    expect(storyOwners.get(1)).toBe('user1');
  });
  
  it('should add a chapter to a story', () => {
    const storyId = createStory('user1', 'The Great Adventure');
    const chapterId = addChapter('user2', storyId, 'It was a dark and stormy night...');
    expect(chapterId).toBe(1);
    expect(chapters.get(`${storyId}-${chapterId}`)).toEqual({ content: 'It was a dark and stormy night...', author: 'user2' });
    expect(storyContributors.get(`${storyId}-user2`)).toBe(true);
  });
  
  it('should create a plot decision', () => {
    const storyId = createStory('user1', 'The Great Adventure');
    const decisionId = createPlotDecision(storyId, 'Go left', 'Go right');
    expect(decisionId).toBe(1);
    expect(plotDecisions.get(`${storyId}-${decisionId}`)).toEqual({ options: ['Go left', 'Go right'], votes: [0, 0], isOpen: true });
  });
  
  it('should allow voting on a plot decision', () => {
    const storyId = createStory('user1', 'The Great Adventure');
    const decisionId = createPlotDecision(storyId, 'Go left', 'Go right');
    voteOnPlot(storyId, decisionId, 0);
    voteOnPlot(storyId, decisionId, 1);
    voteOnPlot(storyId, decisionId, 0);
    expect(plotDecisions.get(`${storyId}-${decisionId}`).votes).toEqual([2, 1]);
  });
  
  it('should close voting on a plot decision', () => {
    const storyId = createStory('user1', 'The Great Adventure');
    const decisionId = createPlotDecision(storyId, 'Go left', 'Go right');
    closeVoting('contract-owner', storyId, decisionId);
    expect(plotDecisions.get(`${storyId}-${decisionId}`).isOpen).toBe(false);
  });
  
  it('should complete a story', () => {
    const storyId = createStory('user1', 'The Great Adventure');
    completeStory('contract-owner', storyId);
    expect(stories.get(storyId).isComplete).toBe(true);
  });
  
  it('should not allow adding chapters to a completed story', () => {
    const storyId = createStory('user1', 'The Great Adventure');
    completeStory('contract-owner', storyId);
    expect(() => addChapter('user2', storyId, 'This should fail')).toThrow('Story not found or completed');
  });
});

