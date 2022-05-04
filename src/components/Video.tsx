import '@videojs/http-streaming';
import { useEffect, useRef, useState } from 'react';
import videojs, { VideoJsPlayer } from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-quality-levels';
import 'videojs-http-source-selector';
import './player.css';

type AudioDescriptionParams = {
  id: string;
};

const videoSource =
  'http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8';

export function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);

  const [isPipActive, setIsPipActive] = useState<boolean>(false);

  const [player, setPlayer] = useState<VideoJsPlayer | null>(null);
  const [pipPlayer, setPipPlayer] = useState<VideoJsPlayer | null>(null);

  function createPipPlayerIntance() {
    if (!pipVideoRef.current) return;
    if (!videoRef.current) return;

    const pipPlayerInstance = videojs(pipVideoRef.current, {
      autoplay: true,
      controls: false,
      muted: true,
      sources: [
        {
          src: videoSource,
          type: 'application/x-mpegURL',
        },
      ],
    });

    pipPlayerInstance.currentTime(videoRef.current.currentTime);

    setPipPlayer(pipPlayerInstance);
  }

  function addPipButtonToPlayer(playerInstance: VideoJsPlayer) {
    if (!playerInstance) return;

    const Button = videojs.getComponent('Button');
    const pipButton = new Button(playerInstance);
    pipButton.handleClick = () => {
      setIsPipActive(prev => !prev);
    };
    pipButton.addClass('vjs-pip-button');

    playerInstance.controlBar.addChild(pipButton);
  }

  useEffect(() => {
    if (isPipActive) {
      createPipPlayerIntance();
    } else {
      setPipPlayer(null);
    }
  }, [isPipActive, player]);

  // Quando é criado uma nova instancia do pip player.
  useEffect(() => {
    if (!player) return;
    if (!pipPlayer) return;

    const handlePlay = () => pipPlayer.play();
    const handlePause = () => pipPlayer.pause();
    const handleWaiting = () => {
      pipPlayer.currentTime(player.currentTime());
      pipPlayer.pause();
    };
    const handlePlaying = () => pipPlayer.play();
    const handlePipPlaying = () => {
      pipPlayer.currentTime(player.currentTime());
      pipPlayer.play();
    };

    player.on('play', handlePlay);
    player.on('pause', handlePause);
    player.on('waiting', handleWaiting);
    player.on('playing', handlePlaying);
    pipPlayer.on('playing', handlePipPlaying);

    return () => {
      player.off('play', handlePlay);
      player.off('pause', handlePause);
      player.off('waiting', handleWaiting);
      player.off('playing', handlePlaying);
      pipPlayer.off('playing', handlePipPlaying);
    };
  }, [player, pipPlayer]);

  // Quando inicia o componente, nós instanciamos o player.
  useEffect(() => {

    if (!videoRef.current) return;
    if (videojs.getPlayer('video-player')) return;

    const playerInstance = videojs(videoRef.current, {
      id: 'video-player',
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      sources: [{ src: videoSource, type: 'application/x-mpegURL' }],
    });

    addPipButtonToPlayer(playerInstance);

    setPlayer(playerInstance);
  }, []);

  return (
    <div className="container">
      <div id="video-player" className="container bg-black">
        <video
          ref={videoRef}
          className="video-js vjs-default-skin"
          preload="auto"
        >
          <track
            kind="captions"
            src="./src/caption.vtt"
            srcLang="pt-BR"
            label="Português Brasil"
            default
          />
        </video>
      </div>

      {isPipActive && (
        <div className="pip-container container my-20 bg-slate-700">
          <video
            ref={pipVideoRef}
            className="video-js vjs-default-skin"
            preload="auto"
          />
        </div>
      )}
    </div>
  );
}
