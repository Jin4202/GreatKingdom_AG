# Great Kingdom - TODO List

This file tracks all past achievements and future tasks for the Great Kingdom web game development.

## 🏁 Past Work (Completed)
- [x] **Project Documentation Setup**
  - [x] Create `game_rules.md` (Core rules, 9x9 board, pieces, victory conditions, etc.)
  - [x] Create `coding_rules.md` (Enforced 5-step workflow: Planning -> Slicing -> Tests -> Implementation -> Test)

## 🚀 Future Work (Pending)

### 1. Planning 
- [x] Choose the technology stack (React + Vite + TypeScript, Canvas for the board).
- [ ] Design the architecture for the game state, UI rendering, and event handling.
- [ ] Define the visual style and aesthetics (e.g., color palette for Blue/Orange/Neutral castles, modern rich UI, gradients, animations).

### 2. Slicing
- [ ] **Phase 1: Game Board & UI** (Grid generation, basic layout, responsiveness).
- [ ] **Phase 2: State Management** (Turn order, piece placement, pass logic).
- [ ] **Phase 3: Core Game Logic** (Capture algorithm, sudden death trigger, territory calculation).
- [ ] **Phase 4: Match Flow & Polish** (Endgame scoring, handicap rules, animations, resets).

### 3. Creating Tests
- [ ] Set up a testing framework (e.g., Jest, Vitest).
- [ ] Write unit tests for board coordinate parsing and piece placement validity.
- [ ] Write unit tests for "Sudden Death" orthogonal enclosure logic.
- [ ] Write unit tests for "Territory" calculation and end-of-game scoring logic.

### 4. Implementation
- [x] **Initialize Project:** Scaffold the application base.
- [x] **Build the 9x9 Board:** Visuals and interaction.
- [x] **Piece Logic:** Implement Blue, Orange, and Neutral Castle placements.
- [x] **Enclosure Algorithm (사활):** Implement the core logic treating boundaries and Neutral Castle as walls.
- [x] **Endgame Algorithm:** Implement the territory counting logic and handicap rules.
- [x] **UI Polish:** Added dynamic scoreboard, real-time territory visualization overlays, and invalid move glow hints.

### 5. Final Tests
- [ ] Automate running all unit tests successfully.
- [ ] Manual browser gameplay testing for edge cases (e.g., invasion, passing rules).
- [ ] Fix any visual or functional bugs discovered.
