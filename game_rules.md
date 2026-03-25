# Great Kingdom - Game Rules

## 1. Game Components
*   **Board**: 9x9 Grid Board.
*   **Pieces**:
    *   40 Blue Castles (First Player).
    *   40 Orange Castles (Second Player).
    *   1 Neutral Castle (Special piece).

## 2. Initial Setup
*   Place the **Neutral Castle** exactly in the center intersection (coordinate `[4, 4]` if 0-indexed).
*   **Turn Order**: First Player takes Blue Castles; Second Player takes Orange Castles.

## 3. Basic Gameplay Flow
*   Players take turns placing one castle on an empty intersection of the board, starting with the First Player.
*   A player may "Pass" their turn if they have no valid moves or for strategic reasons.
*   The game ends when **both players choose to Pass consecutively**.

## 4. Core Rules & Victory Conditions
*   **Sudden Death (Capture = Immediate Win)**:
    *   If a player completely surrounds at least one opponent's piece, the capturing player **instantly wins** the game.
    *   Surrounding is calculated **orthogonally** (up, down, left, right). Diagonals do not count.
    *   You can use your own pieces, the board edges, and the Neutral Castle to form the enclosure.
*   **Placement Restrictions & Territory Definition**:
    1. A Player's territory is defined as a boundary of single player's pieces, the Neutral Castle, and game board edges.
    2. Game board edges can only be used up to 3 times (among up, left, right, down edges) to form a territory. If a space touches all 4 edges, it is not a completed territory.
    3. During the game, if a player creates their territory, the other player cannot place a piece inside the completed territory (Placement Restrictions).
*   **High-Risk Invasions**:
    *   Players can place pieces inside an opponent's *incomplete* territory.
    *   If this invading piece cannot survive and gets surrounded, the invading player instantly loses due to the Sudden Death rule.

## 5. Endgame & Scoring
*   **Territory Calculation**:
    *   Triggered if the game ends via consecutive passes.
    *   Territory = empty intersections completely surrounded orthogonally by a player's pieces, the board edges, and/or the Neutral Castle.
    *   *Note*: Empty spaces bounded *only* by the four edges of the board are completely ignored and score 0 points.
*   **Winning Condition (Handicap Rule)**:
    *   **First Player Wins**: If they secure 3 or more territory points than the Second Player.
    *   **Second Player Wins**: If the First Player's lead is 2 points or fewer, or if the Second Player has more territory.

## 6. Logic Implementation Tips
*   **Universal "Wall" Entity**: Treat the Neutral Castle `[4, 4]` and the out-of-bounds grid areas as the exact same Wall entity to simplify pathfinding logic for capture (사활) and territory (집) calculations.
*   **Immediate Game Over Trigger**: Do not remove captured stones. Instead, the event listener evaluating a "surround" action must bypass piece removal and instantly trigger the `GameOver(winner)` state.
