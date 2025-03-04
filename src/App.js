import React, { useState, useEffect } from 'react';
import { ref, set, onValue, push } from 'firebase/database';
import { database } from './firebase';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import VideoPlayer from './VideoPlayer';
import './App.css';

const ItemType = 'VIDEO';
const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

const fetchVideoDetails = async (videoId) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet`
    );
    const data = await response.json();
    console.log('YouTube API Response:', data);  // ★デバッグ：YouTube APIレスポンスを確認
    if (data.items.length > 0) {
      return {
        title: data.items[0].snippet.title,
        thumbnail: data.items[0].snippet.thumbnails.medium.url,
      };
    } else {
      return { title: 'Video not found', thumbnail: '' };
    }
  } catch (error) {
    console.error('Failed to fetch video details:', error);  // ★エラーデバッグ
    return { title: 'Error fetching details', thumbnail: '' };
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
    <div ref={(node) => drag(ref(node))} className="playlist-item" style={{ opacity: isDragging ? 0.5 : 1 }}>
      <img src={video.thumbnail} alt={video.title} style={{ width: '100%' }} />
      <p>{video.title}</p>
    </div>
  );
};

const App = () => {
  const [playlist, setPlaylist] = useState([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const playlistRef = ref(database, 'playlist');
    onValue(playlistRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Updated Playlist from Firebase:', data);  // ★デバッグ：Firebaseのプレイリスト更新確認
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
      const details = await fetchVideoDetails(videoId); // YouTubeからタイトルとサムネイルを取得
      const newVideo = { id: videoId, ...details };
      const newPlaylistRef = push(ref(database, 'playlist'));
      await set(newPlaylistRef, newVideo);  // ★非同期処理を正しく待つ
      setNewVideoUrl('');
    } else {
      alert('Invalid YouTube URL');
    }
  };

  const moveItem = (fromIndex, toIndex) => {
    const updatedPlaylist = [...playlist];
    const [movedItem] = updatedPlaylist.splice(fromIndex, 1);
    updatedPlaylist.splice(toIndex, 0, movedItem);
    setPlaylist(updatedPlaylist);

    set(ref(database, 'playlist'), updatedPlaylist);  // 並び替え後のプレイリストをFirebaseに保存
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <h1>My WatchParty Playlist</h1>

        {/* 動画再生部分 */}
        {playlist.length > 0 && (
          <VideoPlayer playlist={playlist} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
        )}

        {/* 動画追加部分 */}
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
            <PlaylistItem key={index} index={index} video={video} moveItem={moveItem} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default App;
