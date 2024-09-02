// import { GameModel, MoveModel } from '@myorg/db';
// import { UserModel } from '@myorg/db';
// import mongoose from 'mongoose';


// export async function createNewGame(player1Id: string, player2Id: string) {
//   try {
//     // Ensure both players exist in the database
//     const player1 = await UserModel.findById(player1Id);
//     const player2 = await UserModel.findById(player2Id);

//     if (!player1 || !player2) {
//       throw new Error('One or both players do not exist.');
//     }

//     // Create a new game document
//     const newGame = new GameModel({
//       player1: player1Id,
//       player2: player2Id,
//       startTime: new Date(),
//       status: 'created',
//       result: 'process',
//       winner: null,
//       moves: [],
//     });

//     // Save the new game to the database
//     newGame.save()
//         .then(()=>console.log('New game created successfully:', newGame))
//         .catch((err)=>console.error('New game NOT created IN DB',err));

//     return newGame;
//   } catch (error) {
//     console.error('Error creating new game:', error);
//     throw error;
//   }
// }

// export async function addMove(gameId: string, playerId: string, from: string, to: string,stamp:Date) {
//     try {
//         // Check if the game exists
//         const game = await GameModel.findById(gameId);
//         if (!game) {
//             throw new Error('Game does not exist.');
//         }

//         // Check if the player is part of the game
//         if (game.player1 !== playerId && game.player2 !== playerId) {
//             throw new Error('Player is not part of this game.');
//         }

//         // Create a new move document
//         const newMove = new MoveModel({
//             gameId: game,
//             playerId: playerId,
//             from: from,
//             to: to,
//             timestamp: stamp,
//         });

//         // Save the new move to the database
//         newMove.save();

//         // Update the game to include this move
//         game.moves.push(newMove._id);
//         game.save();

//         console.log('Move added successfully:', newMove);
//         return newMove;
//     } catch (error) {
//         console.error('Error adding move:', error);
//         throw error;
//     }
// }