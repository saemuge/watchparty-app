import React, { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from './firebase';

const VideoPlayer = ({ playlist }) => {
  const [player, setPlayer] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const currentIndexRef = ref(database, 'currentVideoIndex');

    // Firebaseから現在の動画インデックスをリアルタイムで取得
    onValue(currentIndexRef, (snapshot) => {
      if (snapshot.val() !== null) {
        setCurrentIndex(snapshot.val());
      }
    });
  }, []);

  useEffect(() => {
    if (player) {
      player.loadVideoById(playlist[currentIndex]?.id);  // インデックスが変わるたびに新しい動画をロード
    } else {
      initializePlayer();
    }
  }, [currentIndex]);

  const initializePlayer = () => {
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player('player', {
        videoId: playlist[currentIndex]?.id || '',
        events: {
          onStateChange: handleStateChange,
        },
      });
      setPlayer(newPlayer);
    };
  };

  const handleStateChange = (event) => {
    if (event.data === window.YT.PlayerState.ENDED) {
      const nextIndex = (currentIndex + 1) % playlist.length;
      set(ref(database, 'currentVideoIndex'), nextIndex);  // Firebaseに次のインデックスを保存
    }
  };

  return <div id="player" style={{ width: '100%', height: '360px' }}></div>;
};

export default VideoPlayer;
