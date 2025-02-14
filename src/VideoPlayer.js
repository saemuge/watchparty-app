// src/VideoPlayer.js
import React, { useState, useEffect } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { database } from './firebase';  // Firebase設定をインポート

const VideoPlayer = ({ videoId }) => {
  const [isPlaying, setIsPlaying] = useState(false);  // 再生状態の管理
  const [player, setPlayer] = useState(null);  // プレイヤーオブジェクト

  // YouTubeプレイヤーのセットアップ
  useEffect(() => {
    // YouTube Iframe APIをロードする
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }

    // Iframe APIが読み込まれたらプレイヤーをセットアップ
    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player('player', {
        videoId: videoId,  // プレイヤーに表示する動画ID
        events: {
          onStateChange: (event) => {  // 再生状態が変化したとき
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          }
        }
      });
      setPlayer(newPlayer);
    };
  }, [videoId]);

  // プレイ/一時停止ボタン
  const handlePlayPause = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();  // 再生中の場合は一時停止
      } else {
        player.playVideo();  // 停止中の場合は再生
      }

      // Firebaseに状態を保存
      set(ref(database, 'videoStatus'), { isPlaying: !isPlaying });
    }
  };

  // Firebaseから同期
  useEffect(() => {
    const statusRef = ref(database, 'videoStatus');
    onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data && player) {
        if (data.isPlaying && !isPlaying) {
          player.playVideo();  // Firebaseの状態に合わせて再生
        } else if (!data.isPlaying && isPlaying) {
          player.pauseVideo();  // Firebaseの状態に合わせて一時停止
        }
      }
    });
  }, [isPlaying, player]);

  return (
    <div>
      <div id="player"></div>
      <button onClick={handlePlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default VideoPlayer;
