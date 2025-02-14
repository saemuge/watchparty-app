// src/App.js
import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ref, set, onValue, push } from 'firebase/database'; // Firebase関連の関数をインポート
import { database } from './firebase';  // 作成したfirebase.jsをインポート
import VideoPlayer from './VideoPlayer'; // VideoPlayerコンポーネントをインポート
import './App.css';

const ItemType = 'VIDEO';
const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

const fetchVideoDetails = async (videoId) => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet`
  );
  const data = await response.json();
  if (data.items.length > 0) {
    return {
      title: data.items[0].snippet.title,
      thumbnail: data.items[0].snippet.thumbnails.medium.url,
    };
  } else {
    return { title: 'Video not found', thumbnail: '' };
  }
};

const PlaylistItem = ({ video, index, moveItem }) => {
  const [, ref] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={(node) => drag(ref(node))}
      className="playlist-item"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <img src={video.thumbnail} alt={video.title} style={{ width: '100%' }} />
      <p>{video.title}</p>
    </div>
  );
};

const App = () => {
  const [playlist, setPlaylist] = useState([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Firebaseからリアルタイムでプレイリストを取得
  useEffect(() => {
    const playlistRef = ref(database, 'playlist');
    onValue(playlistRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPlaylist(Object.values(data));
      }
    });
  }, []);

  const moveItem = (fromIndex, toIndex) => {
    const updatedPlaylist = [...playlist];
    const [movedItem] = updatedPlaylist.splice(fromIndex, 1);
    updatedPlaylist.splice(toIndex, 0, movedItem);
    setPlaylist(updatedPlaylist);

    // Firebaseに並び替えた結果を保存
    set(ref(database, 'playlist'), updatedPlaylist);
  };

  const extractVideoId = (url) => {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/) || url.match(/(?:https?:\/\/)?youtu\.be\/([^?&]+)/);
    return match ? match[1] : null;
  };

  const addVideo = async () => {
    const videoId = extractVideoId(newVideoUrl);
    if (videoId) {
      const details = await fetchVideoDetails(videoId);
      const newVideo = { id: videoId, ...details };
      const newPlaylistRef = push(ref(database, 'playlist'));
      set(newPlaylistRef, newVideo);
      setNewVideoUrl('');
    } else {
      alert('Invalid YouTube URL');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <h1>My WatchParty Playlist</h1>

        {/* プレイリスト表示部分 */}
        <div className="playlist">
          {playlist.map((video, index) => (
            <PlaylistItem
              key={index}
              index={index}
              video={video}
              moveItem={moveItem}
            />
          ))}
        </div>

        {/* 動画再生部分 */}
        <div className="video-player">
          {playlist.length > 0 && <VideoPlayer videoId={playlist[0].id} />}  {/* プレイリスト内の最初の動画を再生 */}
        </div>

        <div className="add-video-form">
          <input
            type="text"
            value={newVideoUrl}
            onChange={(e) => setNewVideoUrl(e.target.value)}
            placeholder="Enter YouTube URL"
          />
          <button onClick={addVideo}>Add Video</button>
        </div>
      </div>
    </DndProvider>
  );
};

export default App;
