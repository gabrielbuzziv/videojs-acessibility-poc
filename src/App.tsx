
import { VideoPlayer } from './components/Video';
import './index.css';

export function App () {
  return (
    <div className="container mx-auto p-20 bg-slate-50">
      <h1 className="text-2xl  font-sans">POC - Accesibilidade de vídeo</h1>

      <VideoPlayer />
    </div>
  );
}