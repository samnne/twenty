import { useState, useRef } from "react";
import cameraInstax from "./assets/instax_squircle_camera.svg";
import shutterSound from "./assets/shutter.mp3";

function App() {
  const imageModules = import.meta.glob(
    "./assets/pImages/*.{png,jpg,jpeg,svg}",
    { eager: true },
  );
  const images = Object.values(imageModules).map((mod: any) => mod.default);

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [phase, setPhase] = useState<"idle" | "pulling" | "ejecting" | "showing">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio(shutterSound));

  const handleImageClick = (src: string) => {
    if (animating) return;
    if (imageRef.current) {
      imageRef.current.scrollIntoView({ behavior: "instant" });
    }

    audioRef.current.currentTime = 0;
    audioRef.current.play();

    setActiveImage(src);
    setAnimating(true);
    setPhase("pulling");

    timeoutRef.current = setTimeout(() => {
      setPhase("ejecting");
      timeoutRef.current = setTimeout(() => {
        setPhase("showing");
        timeoutRef.current = setTimeout(() => {
          setPhase("idle");
          setAnimating(false);
          setActiveImage(null);
        }, 2200);
      }, 500);
    }, 450);
  };

  const polaroidPhaseClass = {
    idle:     "top-1/20 scale-40 opacity-0",
    pulling:  "top-1/10 scale-70 opacity-60",
    ejecting: "top-1/2 scale-85 opacity-100",
    showing:  "top-2/3 scale-100 opacity-100 -rotate-2",
  }[phase];

  return (
    <main className="min-h-screen p-1 gap-5 from-primary to-accent bg-radial flex flex-col justify-center items-center">
      <h1 className="w-full text-center font-petit font-bold text-8xl h-screen flex justify-center items-center text-white">
        Priya as a Teen!
      </h1>

      <section className="relative flex flex-col items-center w-80 min-h-[520px]">
        <img
          ref={imageRef}
          src={cameraInstax}
          className={`w-full  relative z-100 transition-[filter] duration-300 ${animating ? "brightness-90" : "brightness-100"}`}
          alt="Instax camera"
        />

        {activeImage && phase !== "idle" && (
          <div
            className={`
              absolute left-1/2 -translate-x-1/2 w-44
              bg-white rounded-sm z-30
              p-2.5 pb-9
              shadow-2xl
              transition-all duration-500
              origin-bottom
              ${polaroidPhaseClass}
              ${phase === "showing" ? "ease-[cubic-bezier(0.34,1.56,0.64,1)]" : "ease-in-out"}
            `}
          >
            <img
              src={activeImage}
              alt="Selected photo"
              className="w-full object-contain block"
            />
          </div>
        )}

        {animating && (
          <div className="absolute top-1/5 left-1/3 -translate-x-1/2 -translate-y-1/2 size-22.5 rounded-full bg-white/25 z-20 pointer-events-none animate-pulse" />
        )}
      </section>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 justify-center items-center">
        {images.map((src, index) => (
          <div
            key={index}
            onClick={() => handleImageClick(src as string)}
            className={`
              cursor-pointer rounded-md overflow-hidden
              transition-all duration-200
              ${animating ? "scale-[0.97]" : "scale-100"}
              ${animating && activeImage !== src ? "opacity-60" : "opacity-100"}
              ${activeImage === src && animating ? "outline outline-[3px] outline-[rgba(168,213,240,0.8)]" : ""}
            `}
          >
            <img
              src={src as string}
              alt={`Photo ${index}`}
              className="w-full block"
            />
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;