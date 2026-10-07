import React, { useState, useRef, useEffect } from 'react';
import { RadioStation, YouTubePreset } from '../types/dashboard';
import {
  Radio,
  Youtube,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  ChevronUp,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface MediaPlayerBarProps {
  radioStations: RadioStation[];
  youtubePresets: YouTubePreset[];
  activePlayer: 'none' | 'radio' | 'youtube';
  onSetActivePlayer: (player: 'none' | 'radio' | 'youtube') => void;
}

export const MediaPlayerBar: React.FC<MediaPlayerBarProps> = ({
  radioStations,
  youtubePresets,
  activePlayer,
  onSetActivePlayer,
}) => {
  const [selectedTab, setSelectedTab] = useState<'radio' | 'youtube'>('radio');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Radio state
  const [currentStationIndex, setCurrentStationIndex] = useState<number>(0);
  const [isRadioPlaying, setIsRadioPlaying] = useState<boolean>(false);
  const [radioVolume, setRadioVolume] = useState<number>(0.75);
  const [isRadioMuted, setIsRadioMuted] = useState<boolean>(false);
  const [radioError, setRadioError] = useState<string | null>(null);

  // YouTube state
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [isYoutubePlaying, setIsYoutubePlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentStation = radioStations[currentStationIndex] || radioStations[0];
  const currentVideo = youtubePresets[currentVideoIndex] || youtubePresets[0];

  // Stop radio if YouTube starts
  useEffect(() => {
    if (activePlayer === 'youtube') {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsRadioPlaying(false);
    }
  }, [activePlayer]);

  // Audio element volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isRadioMuted ? 0 : radioVolume;
    }
  }, [radioVolume, isRadioMuted]);

  const handleToggleRadio = () => {
    if (!audioRef.current) return;

    if (isRadioPlaying) {
      audioRef.current.pause();
      setIsRadioPlaying(false);
      onSetActivePlayer('none');
    } else {
      // Pause YouTube if active
      setIsYoutubePlaying(false);
      onSetActivePlayer('radio');
      setRadioError(null);

      // Reload src if needed
      if (audioRef.current.src !== currentStation.streamUrl) {
        audioRef.current.src = currentStation.streamUrl;
      }

      audioRef.current
        .play()
        .then(() => {
          setIsRadioPlaying(true);
        })
        .catch((err) => {
          console.warn('Radio stream playback failed:', err);
          setRadioError('Stream unavailable, try next station');
          setIsRadioPlaying(false);
        });
    }
  };

  const handleSelectStation = (index: number) => {
    setCurrentStationIndex(index);
    setRadioError(null);
    const station = radioStations[index];

    if (audioRef.current) {
      audioRef.current.src = station.streamUrl;
      if (isRadioPlaying || activePlayer === 'radio') {
        setIsYoutubePlaying(false);
        onSetActivePlayer('radio');
        audioRef.current
          .play()
          .then(() => {
            setIsRadioPlaying(true);
          })
          .catch(() => {
            setRadioError('Stream error, tap play to retry');
            setIsRadioPlaying(false);
          });
      }
    }
  };

  const handleSelectVideo = (index: number) => {
    setCurrentVideoIndex(index);
    setIsYoutubePlaying(true);
    // Pause radio immediately
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsRadioPlaying(false);
    onSetActivePlayer('youtube');
    setIsExpanded(true); // expand to show video frame
  };

  const handleToggleYoutube = () => {
    if (isYoutubePlaying) {
      setIsYoutubePlaying(false);
      onSetActivePlayer('none');
    } else {
      // Pause radio immediately
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsRadioPlaying(false);
      setIsYoutubePlaying(true);
      onSetActivePlayer('youtube');
      setIsExpanded(true);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-md border-t border-stone-800 shadow-2xl transition-all">
      {/* Hidden HTML5 Audio Element for Radio */}
      <audio
        ref={audioRef}
        src={currentStation?.streamUrl}
        preload="none"
        onError={() => setRadioError('Connection error')}
      />

      {/* Expanded View (Video Player & Expanded Station/Video Selectors) */}
      {isExpanded && (
        <div className="p-3 sm:p-4 max-w-xl mx-auto border-b border-stone-800 space-y-3 animate-in fade-in duration-200">
          {selectedTab === 'youtube' ? (
            <div>
              {/* YouTube Responsive Embed Container */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-stone-800 shadow-lg">
                {isYoutubePlaying ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${currentVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                    title={currentVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-stone-900">
                    <Youtube className="w-12 h-12 text-red-500 mb-2" />
                    <p className="text-sm font-bold text-stone-200">{currentVideo.title}</p>
                    <button
                      onClick={handleToggleYoutube}
                      className="touch-btn mt-3 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Play className="w-4 h-4 fill-white" /> Start Playback
                    </button>
                  </div>
                )}
              </div>

              {/* YouTube Presets Strip */}
              <div className="mt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                  Family Video Channels:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {youtubePresets.map((preset, idx) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectVideo(idx)}
                      className={`touch-btn p-2 rounded-xl text-left border transition-all ${
                        idx === currentVideoIndex
                          ? 'bg-red-950/40 border-red-500/70 text-red-200'
                          : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <div className="text-xs font-bold truncate leading-tight">{preset.title}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5 capitalize">{preset.category} · {preset.duration}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Radio Expanded Station Grid */
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                Kitchen Radio Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {radioStations.map((station, idx) => {
                  const isCurrent = idx === currentStationIndex;
                  return (
                    <button
                      key={station.id}
                      onClick={() => handleSelectStation(idx)}
                      className={`touch-btn p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between min-h-[58px] ${
                        isCurrent
                          ? 'bg-amber-950/40 border-amber-500/70 text-amber-200'
                          : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold truncate">{station.name}</span>
                        {station.logoText && (
                          <span className="text-[10px] font-mono px-1 rounded bg-stone-800 text-amber-400">
                            {station.logoText}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400 truncate mt-1">
                        {station.genre}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Volume Steps */}
              <div className="mt-3 pt-2 border-t border-stone-800 flex items-center justify-between">
                <span className="text-xs text-stone-400 font-medium">Radio Volume:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsRadioMuted(!isRadioMuted)}
                    className="touch-btn min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-stone-900 border border-stone-800 text-stone-300"
                  >
                    {isRadioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  {[0.25, 0.5, 0.75, 1.0].map((vol) => (
                    <button
                      key={vol}
                      onClick={() => {
                        setRadioVolume(vol);
                        setIsRadioMuted(false);
                      }}
                      className={`touch-btn min-h-[36px] px-2.5 rounded-lg text-xs font-mono font-bold border ${
                        !isRadioMuted && Math.abs(radioVolume - vol) < 0.1
                          ? 'bg-amber-500 text-stone-950 border-amber-400'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {vol * 100}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Bar (Always Visible at bottom, 56px–64px height) */}
      <div className="px-3 py-2 sm:px-4 max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-xl border border-stone-800 shrink-0">
          <button
            onClick={() => {
              setSelectedTab('radio');
            }}
            className={`touch-btn min-h-[44px] px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              selectedTab === 'radio'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span className="hidden sm:inline">Radio</span>
          </button>
          <button
            onClick={() => {
              setSelectedTab('youtube');
            }}
            className={`touch-btn min-h-[44px] px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              selectedTab === 'youtube'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Youtube className="w-4 h-4" />
            <span className="hidden sm:inline">YouTube</span>
          </button>
        </div>

        {/* Center: Current Playing Info (Tap to toggle expand) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="touch-btn flex-1 text-left px-2 py-1 rounded-lg hover:bg-stone-900/60 overflow-hidden min-h-[44px] flex flex-col justify-center"
        >
          {selectedTab === 'radio' ? (
            <div>
              <div className="flex items-center gap-1.5">
                {isRadioPlaying && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
                <span className="text-xs sm:text-sm font-bold text-stone-100 truncate">
                  {currentStation.name}
                </span>
              </div>
              <span className="text-[11px] text-stone-400 truncate block">
                {radioError ? radioError : `${currentStation.genre} · Tap for stations`}
              </span>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1.5">
                {isYoutubePlaying && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
                <span className="text-xs sm:text-sm font-bold text-stone-100 truncate">
                  {currentVideo.title}
                </span>
              </div>
              <span className="text-[11px] text-stone-400 truncate block">
                {isYoutubePlaying ? 'Now Playing' : 'Tap to show video'}
              </span>
            </div>
          )}
        </button>

        {/* Right: Primary Play/Pause CTA & Expand Chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          {selectedTab === 'radio' ? (
            <button
              onClick={handleToggleRadio}
              className={`touch-btn min-h-[44px] min-w-[44px] px-3.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                isRadioPlaying
                  ? 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                  : 'bg-stone-800 text-stone-100 hover:bg-stone-700 border border-stone-700'
              }`}
              title={isRadioPlaying ? 'Pause radio' : 'Play radio'}
            >
              {isRadioPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          ) : (
            <button
              onClick={handleToggleYoutube}
              className={`touch-btn min-h-[44px] min-w-[44px] px-3.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                isYoutubePlaying
                  ? 'bg-red-600 text-white hover:bg-red-500'
                  : 'bg-stone-800 text-stone-100 hover:bg-stone-700 border border-stone-700'
              }`}
              title={isYoutubePlaying ? 'Pause YouTube' : 'Play YouTube'}
            >
              {isYoutubePlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          )}

          {/* Expand/Collapse Chevron Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="touch-btn min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200"
            title={isExpanded ? 'Collapse player' : 'Expand player options'}
          >
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
