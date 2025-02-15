// src/App.js
import React, { useState, useEffect } from 'react';
import { ref, set, onValue, push } from 'firebase/database';
import { database } from './firebase';
import VideoPlayer from './VideoPlayer'; // VideoPlayerコンポーネントをインポート
import './App.css';

const App = () => {
  const [playlist, setPlaylist] = useState([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Firebaseからプレイリストと現在の動画インデックスを取得
  useEffect(() => {
    const playlistRef = ref(database, 'playlist');
    onValue(playlistRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPlaylist(Object.values(data));
      }
    });

    const currentIndexRef = ref(database, 'currentVideoIndex');
    onValue(currentIndexRef, (snapshot) => {
      if (snapshot.val() !== null) {
        setCurrentIndex(snapshot.val());
      }
    });
  }, []);

  const extractVideoId = (url) => {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/) || url.match(/(?:https?:\/\/)?youtu\.be\/([^?&]+)/);
    return match ? match[1] : null;
  };

  const addVideo = async () => {
    const videoId = extractVideoId(newVideoUrl);
    if (videoId) {
      const newVideo = { id: videoId, title: `Video ${playlist.length + 1}` }; // 簡易タイトル
      const newPlaylistRef = push(ref(database, 'playlist'));
      set(newPlaylistRef, newVideo);
      setNewVideoUrl('');
    } else {
      alert('Invalid YouTube URL');
    }
  };

  return (
    <div className="App">
      <h1>My WatchParty Playlist</h1>

      {/* 動画再生部分 */}
      {playlist.length > 0 && (
        <VideoPlayer playlist={playlist} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
      )}

      {/* プレイリスト追加部分 */}
      <div className="add-video-form">
        <input
          type="text"
          value={newVideoUrl}
          onChange={(e) => setNewVideoUrl(e.target.value)}
          placeholder="Enter YouTube URL"
        />
        <button onClick={addVideo}>Add Video</button>
      </div>

      {/* プレイリスト表示部分 */}
      <div className="playlist">
        {playlist.map((video, index) => (
          <div key={index} style={{ margin: '10px 0' }}>
            <p>{video.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
