import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RoomProvider } from './context/RoomContext';
import { Box, Container, Typography } from '@mui/material';
import VideoPlayer from './components/VideoPlayer/VideoPlayer';
import Playlist from './components/Playlist/Playlist';
import AddVideoForm from './components/AddVideoForm/AddVideoForm';

const Room = ({ roomId }) => {
  return (
    <RoomProvider roomId={roomId}>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My WatchParty
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box sx={{ flex: 2 }}>
              <VideoPlayer />
            </Box>
            <Box sx={{ flex: 1 }}>
              <AddVideoForm />
              <Playlist />
            </Box>
          </Box>
        </Box>
      </Container>
    </RoomProvider>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/" element={<Room roomId="default" />} />
      </Routes>
    </Router>
  );
}

export default App;
