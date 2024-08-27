import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/system';
import Box from '@mui/material/Box';

const FloatingCard = styled(Card)(({ theme }) => ({
  position: 'absolute',
  top: '45%',
  left: '33%',
  transform: 'translate(-50%, -50%)',
  zIndex: 10,
  padding: theme.spacing(3),
  boxShadow: theme.shadows[6],
  width: '250px',
  height: '350px', 
  minWidth: '200px',
  textAlign: 'center',
  minHeight: '300px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: `linear-gradient(135deg, ${theme.palette.mode=="dark"?'#1e1e1e':theme.palette.primary.light} 50%, ${theme.palette.secondary.light} 50%)`,
  [theme.breakpoints.down('md')]: {
    top: '50%',
    right: '50%',
    left: 'auto',
    transform: 'translate(50%, -50%)',
  },
  [theme.breakpoints.down('sm')]: {
    top: '50%',
    right: '50%',
    left: 'auto',
    transform: 'translate(50%, -50%)',
  }
}));

const DecoratedImage = styled('img')(({ theme }) => ({
  borderRadius: '50%',
  width: '100px',
  height: '100px',
  objectFit: 'cover',
  border: `4px solid ${theme.palette.success.main}`,
}));

const GrimImage = styled('img')(({ theme }) => ({
  borderRadius: '50%',
  width: '100px',
  height: '100px',
  objectFit: 'cover',
  border: `4px solid ${theme.palette.error.main}`,
}));

interface Player {
  img: string;
  name: string;
}

interface ResultCardProps {
  winner: Player;
  defeated: Player;
  onClose: () => void;
  onNextGame: () => void;
  onRematch: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ winner, defeated, onClose, onNextGame, onRematch }) => {
  return (
    <FloatingCard>
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
      <CardContent sx={{ width: '100%' }}>
        <Typography variant="h5" component="div" gutterBottom>
          {winner.name} Won!
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
          <DecoratedImage src={winner.img} alt={`${winner.name}`} />
          <Typography variant="body1" color="text.secondary">
            vs
          </Typography>
          <GrimImage src={defeated.img} alt={`${defeated.name}`} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Congratulations to the winner. The game has ended.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={onNextGame}
          >
            Next Game
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={onRematch}
          >
            Rematch
          </Button>
        </Box>
      </CardContent>
    </FloatingCard>
  );
};

export default ResultCard;
