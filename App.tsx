import React, {useState, useRef, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated, Button} from 'react-native';

// Type for the board state - each cell can be either 'X', 'O', or null
type Player = 'X' | 'O' | null;

const App: React.FC = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null)); // 3x3 grid
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X'); // 'X' or 'O'
  const [turnMessage, setTurnMessage] = useState<string>('Your Turn'); // Turn indicator
  const [winner, setWinner] = useState<Player>(null); // Track winner
  const [winningCombination, setWinningCombination] = useState<number[] | null>(null); // Winning cells
  const [shouldStopBlinking, setShouldStopBlinking] = useState<boolean>(false); // Stop blinking flag
  const [scores, setScores] = useState<{ X: number; O: number }>({ X: 0, O: 0 }); // Track scores

  // Array of Animated values for each cell
  const animatedValues = useRef(
    Array(9).fill(null).map(() => new Animated.Value(0))
  ).current;

  // Animate the winning cells
  useEffect(() => {
    if (winningCombination && !shouldStopBlinking) {
      const animations = winningCombination.map(index =>
        Animated.sequence([
          Animated.timing(animatedValues[index], {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValues[index], {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      );
      
      // Blink twice and stop
      Animated.stagger(100, animations).start(() => {
        setShouldStopBlinking(true);
      });
    }
  }, [winningCombination, shouldStopBlinking]);

  // Check if there's a winner
  const checkWinner = (board: Player[]): Player | null => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];
    for (let combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinningCombination(combo); // Store the winning combination
        return board[a];
      }
    }
    return null;
  };

  // Handle cell press
  const handlePress = (index: number) => {
    if (board[index] || winner) return; // Ignore if cell is filled or game won

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const foundWinner = checkWinner(newBoard);
    if (foundWinner) {
      setWinner(foundWinner);
      setTurnMessage(`Player ${foundWinner} Wins!`);
      setScores(prevScores => ({
        ...prevScores,
        [foundWinner]: prevScores[foundWinner]! + 1, // Update the score
      }));
    } else if (newBoard.every(cell => cell)) {
      setTurnMessage("It's a Draw!");
    } else {
      const nextPlayer: Player = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(nextPlayer);
      setTurnMessage(nextPlayer === 'X' ? 'Your Turn' : 'Please Wait');
    }
  };

  // Handle game reset
  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningCombination(null);
    setShouldStopBlinking(false);
    setTurnMessage('Your Turn');
  };

  // Render a single cell
  const renderCell = (index: number) => {
    const value = board[index];
    const isWinningCell = winningCombination?.includes(index);

    // Use animated background color if it's a winning cell
    const backgroundColor = isWinningCell
      ? shouldStopBlinking
        ? 'green' // Stop blinking and set to green
        : animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['green', value === 'X' ? '#d6eaff' : '#ffe0e0'],
          })
      : value === 'X'
      ? '#d6eaff'
      : value === 'O'
      ? '#ffe0e0'
      : '#e0e0e0';

    return (
      <Animated.View
        style={[
          styles.cell,
          { backgroundColor }, // Dynamic background color
        ]}>
        <Text style={styles.cellText}>{value}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.turnMessage}>{turnMessage}</Text>

      <View style={styles.board}>
        {board.map((_, index) => (
          <TouchableOpacity key={index} onPress={() => handlePress(index)}>
            {renderCell(index)}
          </TouchableOpacity>
        ))}
      </View>

      {winner || turnMessage === "It's a Draw!" ? (
        <Button title="Reset Game" onPress={handleReset} />
      ) : null}

      <View style={styles.leaderboard}>
        <Text style={styles.leaderboardTitle}>Leaderboard</Text>
        <Text>Player X: {scores.X}</Text>
        <Text>Player O: {scores.O}</Text>
      </View>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
    padding: 16,
  },
  turnMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 300,
    justifyContent: 'center',
  },
  cell: {
    width: 80,
    height: 80,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  cellText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  leaderboard: {
    marginTop: 20,
    alignItems: 'center',
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
  