import React, { useState, useEffect } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { database } from './firebase';

const VideoPlayer = ({ playlist, currentIndex, setCurrentIndex }) => {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }
    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player('player', {
        videoId: playlist[currentIndex].id,  // 現在の動画IDを指定
        events: {
          onStateChange: handleStateChange,
        },
      });
      setPlayer(newPlayer);
    };
  }, [currentIndex]);

  const handleStateChange = (event) => {
    if (event.data === window.YT.PlayerState.ENDED) {
      goToNextVideo();  // 動画が終了したら次の動画へ
    }
  };

  const goToNextVideo = () => {
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);

    // Firebaseに次の動画のインデックスを保存
    set(ref(database, 'currentVideoIndex'), nextIndex);
  };

  return (
    <div>
      <div id="player"></div>
    </div>
  );
};

export default VideoPlayer;
