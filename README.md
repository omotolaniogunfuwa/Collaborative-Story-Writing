# Collaborative Story Writing Platform

A decentralized platform for collaborative storytelling built on Stacks blockchain, allowing multiple authors to contribute to stories and readers to participate in plot decisions through voting.

## Overview

This smart contract implements a platform where:
- Authors can create and contribute to collaborative stories
- Each story can have multiple chapters written by different contributors
- Readers can participate in plot decisions through voting
- Story ownership is tracked through NFTs
- Contributions are permanently recorded on the blockchain

## Features

### Story Management
- Create new stories with unique titles
- Add chapters to existing stories
- Mark stories as complete
- Track story contributors
- NFT-based story ownership

### Collaborative Writing
- Multiple authors can contribute chapters
- Each chapter is attributed to its author
- Maximum chapter length of 1000 characters (UTF-8)
- Contributor tracking system

### Plot Decision System
- Create binary plot decisions
- Community voting on plot directions
- Vote tracking for each option
- Configurable voting periods
- Admin controls for closing votes

## Smart Contract Functions

### Public Functions

#### Story Creation and Management
```clarity
(create-story (title (string-ascii 100)))
(add-chapter (story-id uint) (content (string-utf8 1000)))
(complete-story (story-id uint))
```

#### Plot Decision System
```clarity
(create-plot-decision (story-id uint) (option-a (string-ascii 100)) (option-b (string-ascii 100)))
(vote-on-plot (story-id uint) (decision-id uint) (option uint))
(close-voting (story-id uint) (decision-id uint))
```

### Read-Only Functions
```clarity
(get-story (story-id uint))
(get-chapter (story-id uint) (chapter-id uint))
(get-plot-decision (story-id uint) (decision-id uint))
(is-story-contributor (story-id uint) (author principal))
```

## Technical Details

### Data Structures

#### Stories
```clarity
{ 
  story-id: uint,
  title: (string-ascii 100),
  current-chapter: uint,
  is-complete: bool 
}
```

#### Chapters
```clarity
{
  story-id: uint,
  chapter-id: uint,
  content: (string-utf8 1000),
  author: principal
}
```

#### Plot Decisions
```clarity
{
  story-id: uint,
  decision-id: uint,
  options: (list 2 (string-ascii 100)),
  votes: (list 2 uint),
  is-open: bool
}
```

### Error Codes
- `u100`: Owner-only operation
- `u101`: Resource not found
- `u102`: Resource already exists
- `u103`: Voting closed
- `u104`: Invalid option

## Pull Request Details

### Changes Introduced
- Initial implementation of collaborative story writing platform
- NFT-based story ownership system
- Plot decision voting mechanism
- Contributor tracking system

### Technical Implementation
- Utilizes Clarity's native NFT standards
- Implements efficient data mapping for stories, chapters, and voting
- Ensures proper access control through owner-only functions
- Maintains data integrity through appropriate error handling

### Security Considerations
- Owner-only functions for sensitive operations
- Vote manipulation prevention through single-option voting
- Proper access control for chapter additions
- Story completion controls

### Testing Requirements
1. Story creation and NFT minting
2. Chapter addition by multiple contributors
3. Plot decision creation and voting mechanism
4. Access control for admin functions
5. Error handling for invalid operations

### Deployment Notes
1. Deploy contract
2. Initialize owner principal
3. Verify NFT functionality
4. Test all public functions with various inputs

### Future Improvements
1. Implement reward system for contributors
2. Add chapter revision system
3. Expand voting options beyond binary choices
4. Add time-based voting periods
5. Implement story categorization system

## Usage Example

```clarity
;; Create a new story
(contract-call? .story-platform create-story "The Blockchain Chronicles")

;; Add a chapter
(contract-call? .story-platform add-chapter u1 "It was a dark and stormy night on the blockchain...")

;; Create a plot decision
(contract-call? .story-platform create-plot-decision u1 "The hero mines bitcoin" "The hero stakes ETH")

;; Vote on the plot
(contract-call? .story-platform vote-on-plot u1 u1 u0)
```
