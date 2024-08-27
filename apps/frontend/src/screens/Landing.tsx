import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Register from '../components/Register';
import Cookies from 'js-cookie';
import FlashMessage from '../components/FlashMessage';
import "./Landing.css";  // Import the CSS file

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [flashMessage, setFlashMessage] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const handleGameRoute = () => {
    const userId = Cookies.get('userId');
    if (userId) {
      navigate('/game');
    } else {
      setFlashMessage({ message: 'Please log in to start playing.', type: 'error' });
    }
  };

  const closeFlashMessage = () => {
    setFlashMessage(null);
  };

  return (
    <div className="min-h-screen bg-chess flex flex-col justify-between items-center">
      <header className="w-full header py-4 shadow">
        <div className="container mx-auto flex justify-between items-center px-6">
          <h1 className="text-3xl font-bold">Chess Castle</h1>
          <nav>
            <ul className="nav-list">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main">
        <h2>Welcome to Chess Castle</h2>
        <p>Play chess online with millions of players around the world!</p>
        <button
          onClick={handleGameRoute}
          className="button"
        >
          Start Playing
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="button"
        >
          Login / Register
        </button>
      </main>

      <footer className="w-full footer py-4 text-center">
        <p>&copy; 2024 Chess Castle. All rights reserved.</p>
      </footer>

      <Register open={isModalOpen} onClose={closeModal} />
      {flashMessage && <FlashMessage message={flashMessage.message} type={flashMessage.type} onClose={closeFlashMessage} />}
    </div>
  );
};

export default Landing;
