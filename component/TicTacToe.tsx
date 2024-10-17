// Import dependencies
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {heightPercentageToDP} from 'react-native-responsive-screen';

// Type definition for player values
type Player = 'X' | 'O' | null;

// Initial scores object
const initialScore = {X: 0, O: 0, Draws: 0};

const initialBoard = Array(9).fill(null);
// Haptic feedback configuration options
const hapticOptions = {
  enableVibrateFallback: true, // Use vibration if haptic feedback isn't available
  ignoreAndroidSystemSettings: false, // Respect system haptic settings
};

const TicTacToe: React.FC = () => {
  // State variables for board, current player, and messages
  const [board, setBoard] = useState<Player[]>([...initialBoard]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [turnMessage, setTurnMessage] = useState<string>('Player X Turn');
  const [winner, setWinner] = useState<Player>(null);
  const [winningCombination, setWinningCombination] = useState<number[] | null>(
    null,
  );
  const [shouldStopBlinking, setShouldStopBlinking] = useState<boolean>(false);
  const [scores, setScores] = useState<{X: number; O: number; Draws: number}>(
    initialScore,
  );
  const [firstPlayer, setFirstPlayer] = useState<Player>('X');

  // Create animated values for each cell to handle blinking animations
  const animatedValues = useRef(
    Array(9)
      .fill(null)
      .map(() => new Animated.Value(0)),
  ).current;

  // Load scores from AsyncStorage on component mount
  useEffect(() => {
    const loadScores = async () => {
      try {
        const storedScores = await AsyncStorage.getItem('scores');
        if (storedScores) setScores(JSON.parse(storedScores));
      } catch (error) {
        console.error('Failed to load scores', error);
      }
    };
    loadScores();
  }, []);

  // Save updated scores to AsyncStorage whenever they change
  useEffect(() => {
    const saveScores = async () => {
      try {
        await AsyncStorage.setItem('scores', JSON.stringify(scores));
      } catch (error) {
        console.error('Failed to save scores', error);
      }
    };
    saveScores();
  }, [scores]);

  // Handle blinking animation for winning cells
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
        ]),
      );

      // Stagger animations for better visual effect
      Animated.stagger(100, animations).start(() => {
        setShouldStopBlinking(true);
      });
    }
  }, [winningCombination, shouldStopBlinking]);

  // Check if there's a winner or a draw
  const checkWinner = (board: Player[]): Player | null => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    // Check all winning combinations
    for (let combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinningCombination(combo); // Store the winning combination
        return board[a]; // Return the winner ('X' or 'O')
      }
    }
    return null; // Return null if there's no winner
  };

  // Handle cell press events
  const handlePress = (index: number) => {
    if (board[index] || winner) return; // Ignore if cell is occupied or game is over

    ReactNativeHapticFeedback.trigger('effectDoubleClick', hapticOptions);

    const newBoard = [...board];
    newBoard[index] = currentPlayer; // Mark the cell with the current player's symbol
    setBoard(newBoard);

    const foundWinner = checkWinner(newBoard);

    if (foundWinner) {
      Vibration.vibrate(800); // Vibrate on win
      setWinner(foundWinner);
      setTurnMessage(`Player ${foundWinner} Wins! 🎉`);

      // Update the winner's score and set the next first player
      setScores(prevScores => ({
        ...prevScores,
        [foundWinner]: prevScores[foundWinner] + 1,
      }));
      setFirstPlayer(foundWinner); // Set the next first player
    } else if (newBoard.every(cell => cell)) {
      // Handle draw case
      setTurnMessage("It's a Draw! 🤝");
      setScores(prevScores => ({
        ...prevScores,
        Draws: prevScores.Draws + 1,
      }));
    } else {
      // Switch to the next player
      const nextPlayer: Player = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(nextPlayer);
      setTurnMessage(nextPlayer === 'X' ? 'Player X Turn' : `Player O Turn`);
    }
  };

  // Reset the game board
  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningCombination(null);
    setShouldStopBlinking(false);
    setTurnMessage(firstPlayer == 'X' ? 'Player X Turn' : `Player O's Turn`);
    setCurrentPlayer(firstPlayer);
  };

  // Reset the scores
  const resetScores = async () => {
    const newScores = {X: 0, O: 0, Draws: 0};
    setScores(newScores);
    try {
      await AsyncStorage.setItem('scores', JSON.stringify(newScores));
    } catch (error) {
      console.error('Failed to reset scores', error);
    }
  };

  // Check if two score objects are equal
  const areScoresEqual = (a: any, b: any) => {
    return Object.keys(a).every(key => a[key] === b[key]);
  };

  // Render a single cell
  const renderCell = (index: number) => {
    const value = board[index];
    const isWinningCell = winningCombination?.includes(index);

    const backgroundColor = isWinningCell
      ? shouldStopBlinking
        ? '#4CAF50'
        : animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['#4CAF50', value === 'X' ? '#BBDEFB' : '#FFCDD2'],
          })
      : value === 'X'
      ? '#BBDEFB'
      : value === 'O'
      ? '#FFCDD2'
      : '#E0E0E0';

    return (
      <Animated.View style={[styles.cell, {backgroundColor}]}>
        <Text style={styles.cellText}>{value}</Text>
      </Animated.View>
    );
  };

  // Render a reusable button component
  const renderButton = (title: string, onPress: () => void) => (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tic Tac Toe</Text>

      {/* Leaderboard displaying scores */}
      <View style={styles.leaderboard}>
        <View style={styles.score}>
          <Text style={styles.scoreTitle}>Player X</Text>
          <Text style={styles.scoreValue}>{scores.X}</Text>
        </View>
        <View style={styles.score}>
          <Text style={styles.scoreTitle}>Draws</Text>
          <Text style={styles.scoreValue}>{scores.Draws}</Text>
        </View>
        <View style={styles.score}>
          <Text style={styles.scoreTitle}>Player O</Text>
          <Text style={styles.scoreValue}>{scores.O}</Text>
        </View>
      </View>

      <Text style={styles.turnMessage}>{turnMessage}</Text>

      {/* Render game board */}
      <View style={styles.board}>
        {board.map((_, index) => (
          <Pressable key={index} onPress={() => handlePress(index)}>
            {renderCell(index)}
          </Pressable>
        ))}
      </View>

      {/* Reset buttons */}
      <View style={{opacity: winner || board.some(cell => cell) ? 1 : 0, marginTop:30}}>
        {renderButton('Reset Game', handleReset)}
      </View>
      <View style={{opacity: areScoresEqual(scores, initialScore) ? 0 : 1}}>
        {renderButton('Reset Scores', resetScores)}
      </View>
    </View>
  );
};

export default TicTacToe;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height:
      Platform.OS == 'android'
        ? heightPercentageToDP(100)
        : heightPercentageToDP(90),
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  leaderboard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    width: '100%',
  },
  score: {
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  turnMessage: {
    fontSize: 22,
    color: '#FFF',
    marginBottom: 20,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 300,
    justifyContent: 'center',
  },
  cell: {
    width: 70,
    height: 70,
    margin: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  cellText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
