import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Player = 'X' | 'O' | null;

const App: React.FC = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [turnMessage, setTurnMessage] = useState<string>('Your Turn');
  const [winner, setWinner] = useState<Player>(null);
  const [winningCombination, setWinningCombination] = useState<number[] | null>(
    null,
  );
  const [shouldStopBlinking, setShouldStopBlinking] = useState<boolean>(false);
  const [scores, setScores] = useState<{X: number; O: number; Draws: number}>({
    X: 0,
    O: 0,
    Draws: 0,
  });

  const animatedValues = useRef(
    Array(9)
      .fill(null)
      .map(() => new Animated.Value(0)),
  ).current;

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

      Animated.stagger(100, animations).start(() => {
        setShouldStopBlinking(true);
      });
    }
  }, [winningCombination, shouldStopBlinking]);

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
    for (let combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinningCombination(combo);
        return board[a];
      }
    }
    return null;
  };

  const handlePress = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const foundWinner = checkWinner(newBoard);
    if (foundWinner) {
      setWinner(foundWinner);
      setTurnMessage(`Player ${foundWinner} Wins! 🎉`);
      setScores(prevScores => ({
        ...prevScores,
        [foundWinner]: prevScores[foundWinner] + 1,
      }));
    } else if (newBoard.every(cell => cell)) {
      setTurnMessage("It's a Draw! 🤝");
      setScores(prevScores => ({
        ...prevScores,
        Draws: prevScores.Draws + 1,
      }));
    } else {
      const nextPlayer: Player = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(nextPlayer);
      setTurnMessage(nextPlayer === 'X' ? 'Your Turn' : 'Please Wait...');
    }
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningCombination(null);
    setShouldStopBlinking(false);
    setTurnMessage('Your Turn');
  };

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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tic Tac Toe</Text>

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

      <View style={styles.board}>
        {board.map((_, index) => (
          <TouchableOpacity key={index} onPress={() => handlePress(index)}>
            {renderCell(index)}
          </TouchableOpacity>
        ))}
      </View>

      {winner || turnMessage.includes('Draw') ? (
        <Button title="Reset Game" onPress={handleReset} />
      ) : null}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
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
    width: 80,
    height: 80,
    margin: 8,
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
});
