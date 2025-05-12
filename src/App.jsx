import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import "lite-youtube-embed/src/lite-yt-embed.css";
import "lite-youtube-embed";
import "./index.css";

function App() {
  const [songs, setSongs] = useLocalStorage("songs", []);
  const [nombre, setNombre] = useState("");
  const [url, setUrl] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [ordenar, setOrdenar] = useState(false);
  const [videoModal, setVideoModal] = useState(null);

   useEffect(() => {
    const cerrarConEscape = (e) => {
      if (e.key === "Escape") {
        setVideoModal(null);
      }
    };

    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, []);

  const esURLValida = (url) => {
    const patron = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return patron.test(url);
  };

  const urlDuplicada = (url) => {
    return songs.some((song) => song.url === url);
  };

  const obtenerVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
  };

  const agregarCancion = () => {
    if (!nombre.trim() || !url.trim()) {
      alert("Ambos campos son obligatorios.");
      return;
    }

    if (!esURLValida(url)) {
      alert("La URL debe ser válida de YouTube.");
      return;
    }

    if (urlDuplicada(url)) {
      alert("Esta URL ya fue agregada.");
      return;
    }
    

    const nueva = { nombre, url, veces: 0 };
    setSongs([...songs, nueva]);
    setNombre("");
    setUrl("");
  };

  const reproducirCancion = (index) => {
    const nuevas = [...songs];
    nuevas[index].veces += 1;
    setSongs(nuevas);
    const videoId = obtenerVideoId(nuevas[index].url);
    if (videoId) setVideoModal(videoId);
  };

  const eliminarCancion = (index) => {
    if (confirm("¿Estás seguro de eliminar esta canción?")) {
      const nuevas = songs.filter((_, i) => i !== index);
      setSongs(nuevas);
    }
  };

  const cancionesFiltradas = songs
    .filter((song) => song.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => (ordenar ? b.veces - a.veces : 0));

  return (
    <body>
       <header className="encabezado">
      <img src="fondo.png" alt="Logo Música" className="logo-header" />
    </header>

    <main>

      <h2>🎵 Agregar Canción</h2>
      <input
        type="text"
        placeholder="Nombre de la canción"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        type="text"
        placeholder="URL de YouTube"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={agregarCancion}>Agregar</button>

      <hr />

      <h2>🎧 Lista de Canciones</h2>
      <input
        type="text"
        placeholder="Buscar canción"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <button onClick={() => setOrdenar(!ordenar)}>
        {ordenar ? "Quitar ordenamiento" : "Ordenar por reproducciones ↓"}
      </button>

      <ul>
  {cancionesFiltradas.map((song, index) => {
    return (
      <li key={index}>
        <strong>{song.nombre}</strong> <br />
        Reproducciones: {song.veces}
        <br />
        <button onClick={() => reproducirCancion(index)}>▶️ Play</button>
        <button onClick={() => eliminarCancion(index)}>🗑️ Eliminar</button>
      </li>
    );
  })}
</ul>

      {videoModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => setVideoModal(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <lite-youtube videoid={videoModal} style={{ width: "560px", height: "400px" }} />
            <button onClick={() => setVideoModal(null)}>❌ Cerrar</button>
          </div>
        </div>
      )}
    </main>
    </body>
  );
}

export default App;