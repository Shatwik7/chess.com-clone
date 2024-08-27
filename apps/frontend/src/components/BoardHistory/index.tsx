import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';

interface BoardHistoryProps {
  moves: string[];
}

const BoardHistory: React.FC<BoardHistoryProps> = ({ moves }) => {
  // Format moves into pairs
  const formattedMoves = moves.reduce((acc: string[][], move, index) => {
    if (index % 2 === 0) {
      acc.push([move]);
    } else {
      acc[acc.length - 1].push(move);
    }
    return acc;
  }, []);

  return (
    <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 300 }} aria-label="board history table">
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333', backgroundColor: '#f0f0f0' }}>Move Number</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333', backgroundColor: '#f0f0f0' }}>White</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333', backgroundColor: '#f0f0f0' }}>Black</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formattedMoves.map((movePair, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:nth-of-type(even)': { backgroundColor: '#cccccc' },
                  '&:nth-of-type(odd)': { backgroundColor: '#e0e0e0' },
                  height: '20px', // Decreased row height
                }}
              >
                <TableCell align="center" sx={{ fontSize: '0.75rem', padding: '4px' ,color:'#333'}}>{index + 1}</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.75rem', padding: '4px',color:'#333' }}>{movePair[0]}</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.75rem', padding: '4px' ,color:'#333'}}>{movePair[1] || ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BoardHistory;
