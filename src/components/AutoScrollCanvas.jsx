import { useEffect, useRef, useState } from "react";

const AutoScrollCanvas = ({ images, height = 280, speed = 0.8 }) => {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loaders = images.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ img, width: img.width, height: img.height });
          img.onerror = () => resolve(null);
          img.src = src;
        })
    );

    Promise.all(loaders).then((list) => {
      if (!isMounted) return;
      const filtered = list.filter(Boolean);
      setLoaded(filtered);
    });

    return () => {
      isMounted = false;
    };
  }, [images]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loaded.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;

    const resize = () => {
      const width = parent ? parent.clientWidth : 800;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    // Scaled widths maintaining aspect ratio to fixed height
    const baseWidths = loaded.map((item) => Math.round((item.img.width / item.img.height) * height));

    // Build track that covers at least 2x viewport width
    let positions = [];
    let widths = [];
    let totalWidth = 0;
    const viewW = canvas.clientWidth;
    let pointer = 0;
    while (totalWidth < viewW * 2) {
      const w = baseWidths[pointer % baseWidths.length];
      positions.push(totalWidth);
      widths.push(w);
      totalWidth += w;
      pointer++;
    }

    let raf = 0;
    const draw = () => {
      const vw = canvas.clientWidth;
      ctx.clearRect(0, 0, vw, height);

      // Move positions
      for (let i = 0; i < positions.length; i++) {
        positions[i] -= speed;
      }

      // Recycle items that moved off-screen
      while (positions.length && positions[0] + widths[0] < 0) {
        const w = widths.shift();
        positions.shift();
        const lastPos = positions[positions.length - 1] + widths[widths.length - 1];
        positions.push(lastPos);
        widths.push(w);
      }

      // Draw segments cycling through images
      for (let i = 0; i < positions.length; i++) {
        const x = positions[i];
        const w = widths[i];
        const item = loaded[i % loaded.length];
        ctx.drawImage(item.img, 0, 0, item.img.width, item.img.height, Math.round(x), 0, Math.round(w), height);
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [loaded, height, speed]);

  return (
    <div id="gallery" className="w-full overflow-hidden rounded-xl border" style={{ boxShadow: "var(--shadow-elegant)" }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default AutoScrollCanvas;
