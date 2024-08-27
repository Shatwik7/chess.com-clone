import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/system';
import BoardHistory from '../BoardHistory'; // Assuming you have a BoardHistory component
import { Theme } from '@mui/material';

// Styled button with dark theme
const DarkButton = styled(Button)(({ theme, selected }: { theme: Theme, selected: any }) => ({
  backgroundColor: selected ? theme.palette.secondary.main : theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: selected ? theme.palette.secondary.dark : theme.palette.primary.dark,
  },
  padding: theme.spacing(2, 4),
  borderRadius: theme.shape.borderRadius,
  minWidth: '200px',
  textTransform: 'none',
  boxShadow: selected ? theme.shadows[6] : theme.shadows[2],
  transition: 'all 0.3s ease',
}));
const DarkButtonsec = styled(Button)(({ theme, selected }: { theme: Theme, selected: any }) => ({
  backgroundColor: selected ? theme.palette.secondary.main : theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: selected ? theme.palette.secondary.dark : theme.palette.primary.dark,
  },
  minWidth: '100px',
  textTransform: 'none',
  boxShadow: selected ? theme.shadows[6] : theme.shadows[2],
  transition: 'all 0.3s ease',
}));

const TimeButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  '& .MuiButton-root': {
  },
  '& .MuiButtonGroup-grouped:not(:last-of-type)': {
  },
}));

const TabPanel = ({ value, index, children }: { value: any, index: any, children: any }) => {
  return value === index && (
    <Box sx={{ p: 3, width: '100%' }}>
      {children}
    </Box>
  );
};

interface Props {
  gameStarted: boolean;
  handleStartGame: () => void;
  gameHistory: any; // Replace with the actual type of gameHistory
  handleResign: () => void;
  handleTimeChange: (time: string) => void;
  selectedTime: string;
}

const GameControlPanel = ({
  gameStarted,
  handleStartGame,
  gameHistory,
  handleResign,
  handleTimeChange,
  selectedTime,
}: Props) => {
  const [tabValue, setTabValue] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Card sx={{ maxWidth: 600, boxShadow: 3, borderRadius: 2 }}>
  <CardContent>
    <Tabs
      value={tabValue}
      onChange={handleTabChange}
      aria-label="game control tabs"
    >
      {gameStarted && <Tab label="Play" />}  {/* Tab 0 if gameStarted */}
      <Tab label="New Game" />                {/* Tab 1 if gameStarted, else Tab 0 */}
      <Tab label="Games" />                   {/* Tab 2 if gameStarted, else Tab 1 */}
      <Tab label="Players" />                 {/* Tab 3 if gameStarted, else Tab 2 */}
    </Tabs>

    {gameStarted && (
      <TabPanel value={tabValue} index={0}>  {/* TabPanel for Play, index 0 */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{ width: '100%',height:'450px'}}>
          <BoardHistory moves={gameHistory} />
          <Box sx={{ mt: 2, width: '100%',textAlign: 'center' }}>
          <DarkButtonsec  onClick={handleResign}>
            Resign
          </DarkButtonsec >
          <DarkButtonsec  onClick={() => { console.log('Draw clicked') }}>
            Draw
          </DarkButtonsec >
          </Box>
        </Box>
      </TabPanel>
    )}

    <TabPanel value={tabValue} index={gameStarted ? 1 : 0}>  {/* TabPanel for New Game */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{ width: '100%' ,height:'450px' }}
      >
        <DarkButton onClick={handleStartGame}>
          Start Game
        </DarkButton>
        <Box sx={{ mt: 2, width: '100%',textAlign: 'center' }}>
          <TimeButtonGroup variant="contained" aria-label="time control button group">
            {['5min', '10min', '20min'].map((time) => (
              <DarkButton
                key={time}
                onClick={() => handleTimeChange(time)}
                selected={selectedTime === time}
              >
                {time}
              </DarkButton>
            ))}
          </TimeButtonGroup>
        </Box>
      </Box>
    </TabPanel>

    <TabPanel value={tabValue} index={gameStarted ? 2 : 1}>  {/* TabPanel for Games */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{ width: '100%',height:'450px' }}>
        <Typography variant="h6" gutterBottom>
          Previous Games
        </Typography>
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Typography variant="body1">Game 1</Typography>
          <Typography variant="body1">Game 2</Typography>
          <Typography variant="body1">Game 3</Typography>
        </Box>
      </Box>
    </TabPanel>

    <TabPanel value={tabValue} index={gameStarted ? 3 : 2}>  {/* TabPanel for Players */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{ width: '100%',height:'450px' }}
      >
        <Typography variant="h6" gutterBottom>
          Players
        </Typography>
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Typography variant="body1">Player 1</Typography>
          <Typography variant="body1">Player 2</Typography>
          <Typography variant="body1">Player 3</Typography>
        </Box>
      </Box>
    </TabPanel>
  </CardContent>
</Card>

  );
};

export default GameControlPanel;
